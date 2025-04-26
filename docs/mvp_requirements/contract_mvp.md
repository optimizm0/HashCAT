# HashCAT MVP 合约功能规范文档
**Version: MVP-v1.0** | **Last Updated: 2024-03-22**

## 一、跨链桥合约 (Bridge)

### 1. 核心功能
```move
module bridge {
    // 铸造 sBTC
    public entry fun mint(
        amount: u64,
        btc_address: vector<u8>,
        btc_proof: vector<u8>,
        signatures: vector<vector<u8>>,
    );

    // 销毁 sBTC
    public entry fun burn(
        sbtc_coin: Coin<SBTC>,
        btc_address: vector<u8>,
    );

    // 地址映射管理
    public entry fun register_address(
        btc_address: vector<u8>,
        sui_address: address,
    );
}
```

### 2. 事件
- `BridgeMintEvent`: sBTC 铸造事件
- `BridgeBurnEvent`: sBTC 销毁事件
- `AddressRegisteredEvent`: 地址映射注册事件

### 3. 安全特性
- 多重签名验证
- 交易证明验证
- 地址映射验证

## 二、代币兑换合约 (Swap)

### 1. 核心功能
```move
module swap {
    // 代币兑换
    public entry fun swap<CoinTypeIn, CoinTypeOut>(
        coin_in: Coin<CoinTypeIn>,
        min_amount_out: u64,
        recipient: address,
    );

    // 添加流动性
    public entry fun add_liquidity<CoinTypeA, CoinTypeB>(
        coin_a: Coin<CoinTypeA>,
        coin_b: Coin<CoinTypeB>,
    );

    // 移除流动性
    public entry fun remove_liquidity<CoinTypeA, CoinTypeB>(
        lp_token: Coin<LPToken>,
    );
}
```

### 2. 事件
- `SwapEvent`: 代币兑换事件
- `LiquidityAddedEvent`: 添加流动性事件
- `LiquidityRemovedEvent`: 移除流动性事件

### 3. 价格机制
- 恒定乘积做市商模型
- Chainlink 预言机集成
- 滑点保护

## 三、保险 NFT 合约 (Insurance)

### 1. 核心功能
```move
module insurance {
    // 铸造保险 NFT
    public entry fun mint_insurance(
        amount: u64,
        duration: u64,
        premium: Coin<SBTC>,
    );

    // 赔付申请
    public entry fun claim(
        insurance_nft: InsuranceNFT,
        proof: vector<u8>,
    );

}
```

### 2. 事件
- `InsuranceMintEvent`: NFT 铸造事件
- `InsuranceClaimEvent`: 赔付事件

### 3. 定价模型
```move
// 简化线性定价模型
let premium = base_rate * (1 + hashrate_volatility / 100);
```

## 四、债券池合约 (BondPool)

### 1. 核心功能
```move
module bond_pool {
    // 质押代币
    public entry fun stake(
        amount: Coin<SBTC>,
        duration: u64,
    );

    // 提取收益
    public entry fun claim_rewards(
        stake_id: ID,
    );

    // 赎回质押
    public entry fun unstake(
        stake_id: ID,
    );
}
```

### 2. 事件
- `StakeEvent`: 质押事件
- `UnstakeEvent`: 赎回事件
- `RewardClaimEvent`: 收益提取事件

### 3. 债券定价机制
采用动态债券价格模型：价格 = 10000 + (总储备量 / 1,000,000)
价格上限15000（1.5倍面值），下限10000（面值）
当保险赔付导致资金池减少时，债券价格下降，提升后续购买吸引力

### 4. 收益动态调节
APY计算公式：APY = 基础收益率 - (总储备量 / 1,000,000)%
设置最低收益率保障（0.1%），避免负收益
资金池规模越大，APY越低，形成自动平衡机制

### 5. 巨灾债券特性
引入insurance_payout函数模拟保险赔付事件
赔付操作会触发：
资金池规模缩减 → 债券价格下降 → APY上升
形成风险对冲的正向循环

### 6. 赎回机制创新
赎回价值 = 债券面值 * 当前价格 / 10000
设置1年锁定期，防止短期套利
实际收益取决于购买和赎回时的价格差


## 五、数据验证合约 (Oracle)

### 1. 核心功能
```move
module oracle {
    // 更新算力数据
    public entry fun update_hashrate(
        hashrate: u64,
        timestamp: u64,
        signature: vector<u8>,
    );

    // 更新代币价格
    public entry fun update_price(
        token: TypeName,
        price: u64,
        timestamp: u64,
        signature: vector<u8>,
    );

    // 验证算力波动
    public fun verify_hashrate_drop(
        start_time: u64,
        end_time: u64,
    ): bool;
}
```

### 2. 事件
- `HashrateUpdateEvent`: 算力更新事件
- `PriceUpdateEvent`: 价格更新事件
- `VolatilityAlertEvent`: 波动预警事件

### 3. 验证机制
- 5分钟数据更新周期
- 10分钟算力下跌验证
- 多源数据交叉验证

## 六、合约间交互流程

### 1. 投保流程
```plaintext
1. Oracle 验证当前算力状态
2. Insurance 计算保费
3. Swap 完成代币兑换（如需）
4. Insurance 铸造保险 NFT
```

### 2. 赔付流程
```plaintext
1. Oracle 验证算力下跌触发条件
2. Insurance 验证保险 NFT 有效性
3. BondPool 提供赔付资金
4. Insurance 执行赔付
```

### 3. 质押流程
```plaintext
1. Swap 完成代币兑换（如需）
2. BondPool 接收质押
3. BondPool 分配收益
```
