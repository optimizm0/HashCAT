#[test_only]
module hashcat::sbtc_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::clock;
    use hashcat::sbtc::{Self, SystemState, BtcAddressMapping, AdminCap};

    #[test]
    fun test_mint_and_burn() {
        let scenario = test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(&mut scenario);
        
        // 初始化系统
        sbtc::init(ctx);
        
        // 获取系统状态和地址映射
        let system_state = test_scenario::take_shared<SystemState>(&mut scenario);
        let btc_mapping = test_scenario::take_shared<BtcAddressMapping>(&mut scenario);
        let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
        
        // 创建测试时钟
        let clock = clock::create_for_testing(ctx);
        
        // 测试铸币
        let amount = 1000;
        let btc_address = b"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
        let signatures = vector::empty();
        vector::push_back(&mut signatures, b"signature1");
        vector::push_back(&mut signatures, b"signature2");
        vector::push_back(&mut signatures, b"signature3");
        
        sbtc::mint(
            &mut system_state,
            &mut btc_mapping,
            amount,
            btc_address,
            signatures,
            &clock,
            ctx
        );
        
        // 测试销毁
        let sbtc = test_scenario::take_from_sender<sui::coin::Coin<sui::sui::SUI>>(&mut scenario);
        sbtc::burn(
            &mut system_state,
            &mut btc_mapping,
            sbtc,
            btc_address,
            &clock,
            ctx
        );
        
        // 清理
        test_scenario::return_shared(system_state);
        test_scenario::return_shared(btc_mapping);
        test_scenario::return_to_sender(admin_cap);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_pause_and_unpause() {
        let scenario = test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(&mut scenario);
        
        // 初始化系统
        sbtc::init(ctx);
        
        // 获取系统状态
        let system_state = test_scenario::take_shared<SystemState>(&mut scenario);
        let admin_cap = test_scenario::take_from_sender<AdminCap>(&mut scenario);
        
        // 测试暂停
        sbtc::pause(&mut system_state, &admin_cap);
        
        // 测试恢复
        sbtc::unpause(&mut system_state, &admin_cap);
        
        // 清理
        test_scenario::return_shared(system_state);
        test_scenario::return_to_sender(admin_cap);
        test_scenario::end(scenario);
    }
} 