module hashcat::sbtc {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::vec_set::{Self, VecSet};
    use sui::clock::{Self, Clock};
    use sui::vec;

    /// 错误码
    const EInvalidAmount: u64 = 0;
    const EInvalidAddress: u64 = 1;
    const EInvalidSignature: u64 = 2;
    const ETimeLockNotExpired: u64 = 3;
    const ESystemPaused: u64 = 4;

    /// 系统状态
    struct SystemState has key {
        id: UID,
        is_paused: bool,
        admin_cap: AdminCap,
        min_signatures: u64,
        validators: VecSet<address>,
        time_lock: u64,
    }

    /// 管理员权限
    struct AdminCap has key {
        id: UID,
    }

    /// BTC地址映射
    struct BtcAddressMapping has key {
        id: UID,
        sui_to_btc: vector<BtcAddress>,
        btc_to_sui: vector<address>,
    }

    /// BTC地址结构
    struct BtcAddress has store {
        address: vector<u8>,
    }

    /// 铸币事件
    struct MintEvent has copy, drop {
        amount: u64,
        btc_address: vector<u8>,
        sui_address: address,
    }

    /// 销毁事件
    struct BurnEvent has copy, drop {
        amount: u64,
        btc_address: vector<u8>,
        sui_address: address,
    }

    /// 初始化系统
    public fun init(ctx: &mut TxContext) {
        let system_state = SystemState {
            id: object::new(ctx),
            is_paused: false,
            admin_cap: AdminCap {
                id: object::new(ctx),
            },
            min_signatures: 3,
            validators: vec_set::empty(),
            time_lock: 24 * 60 * 60, // 24小时
        };

        let btc_mapping = BtcAddressMapping {
            id: object::new(ctx),
            sui_to_btc: vector::empty(),
            btc_to_sui: vector::empty(),
        };

        transfer::share_object(system_state);
        transfer::share_object(btc_mapping);
        transfer::transfer(system_state.admin_cap, tx_context::sender(ctx));
    }

    /// 铸造sBTC
    public fun mint(
        system_state: &mut SystemState,
        btc_mapping: &mut BtcAddressMapping,
        amount: u64,
        btc_address: vector<u8>,
        signatures: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 检查系统是否暂停
        assert!(!system_state.is_paused, ESystemPaused);

        // 验证签名
        assert!(vec::length(&signatures) >= system_state.min_signatures, EInvalidSignature);

        // 创建sBTC代币
        let sbtc = coin::mint_for_testing(amount, ctx);

        // 记录地址映射
        let sui_address = tx_context::sender(ctx);
        let btc_addr = BtcAddress { address: btc_address };
        vector::push_back(&mut btc_mapping.sui_to_btc, btc_addr);
        vector::push_back(&mut btc_mapping.btc_to_sui, sui_address);

        // 发送代币
        transfer::transfer(sbtc, sui_address);

        // 触发事件
        event::emit(MintEvent {
            amount,
            btc_address,
            sui_address,
        });
    }

    /// 销毁sBTC
    public fun burn(
        system_state: &mut SystemState,
        btc_mapping: &mut BtcAddressMapping,
        sbtc: Coin<sBTC>,
        btc_address: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 检查系统是否暂停
        assert!(!system_state.is_paused, ESystemPaused);

        // 验证时间锁
        assert!(clock::timestamp_ms(clock) >= system_state.time_lock, ETimeLockNotExpired);

        // 验证地址映射
        let sui_address = tx_context::sender(ctx);
        let index = vector::index_of(&btc_mapping.btc_to_sui, &sui_address);
        assert!(index < vector::length(&btc_mapping.btc_to_sui), EInvalidAddress);

        // 销毁代币
        let amount = coin::value(&sbtc);
        coin::destroy_zero(sbtc);

        // 触发事件
        event::emit(BurnEvent {
            amount,
            btc_address,
            sui_address,
        });
    }

    /// 紧急暂停系统
    public fun pause(
        system_state: &mut SystemState,
        _admin: &AdminCap
    ) {
        system_state.is_paused = true;
    }

    /// 恢复系统
    public fun unpause(
        system_state: &mut SystemState,
        _admin: &AdminCap
    ) {
        system_state.is_paused = false;
    }
}
