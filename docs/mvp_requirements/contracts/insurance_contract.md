# 保险 NFT 合约规范 (Insurance)
**Version: MVP-v1.0** | **Last Updated: 2024-03-22**

## 一、合约概述
保险 NFT 合约实现基于比特币算力波动的保险产品，通过 NFT 代表保险凭证，支持投保、赔付和赎回功能。

## 二、核心功能
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

    // 保险到期赎回
    public entry fun redeem(
        insurance_nft: InsuranceNFT,
    );
}
```

## 三、事件定义
- `InsuranceMintEvent`: NFT 铸造事件
  - 记录保险金额、期限
  - 记录保费金额、投保人地址
  - NFT ID 和时间戳
- `InsuranceClaimEvent`: 赔付事件
  - 记录赔付金额、触发条件
  - 记录 NFT ID、赔付时间
- `InsuranceRedeemEvent`: 赎回事件
  - 记录赎回金额、NFT ID
  - 记录赎回时间、接收地址

## 四、定价模型
```move
// 简化线性定价模型
struct PricingParams {
    base_rate: u64,        // 基础费率，例如 0.1% 每天
    volatility_factor: u64, // 波动率影响因子
}

// 保费计算
let premium = base_rate * (1 + hashrate_volatility / 100);
```

## 五、NFT 属性
```move
struct InsuranceNFT has key {
    id: ID,
    amount: u64,           // 保险金额
    start_time: u64,       // 开始时间
    duration: u64,         // 保险期限
    premium_paid: u64,     // 已付保费
    status: u8,            // 状态：活跃/已赔付/已到期
    owner: address,        // 所有者地址
}
```

## 六、错误处理
```move
const ERROR_INVALID_AMOUNT: u64 = 1;
const ERROR_INVALID_DURATION: u64 = 2;
const ERROR_INSUFFICIENT_PREMIUM: u64 = 3;
const ERROR_NFT_NOT_ACTIVE: u64 = 4;
const ERROR_INVALID_CLAIM: u64 = 5;
const ERROR_NOT_EXPIRED: u64 = 6;
```

## 七、限制与约束
1. 保险参数限制
   - 最小保险金额: 0.1 sBTC
   - 最大保险金额: 10 sBTC
   - 最短期限: 7 天
   - 最长期限: 365 天

2. 赔付条件
   - 算力下跌阈值: 10%
   - 观察期: 10 分钟
   - 冷却期: 24 小时

3. 保费限制
   - 最低保费率: 0.05% 每天
   - 最高保费率: 1% 每天
   - 支付币种: sBTC

## 八、安全机制
1. NFT 安全
   - 唯一性验证
   - 所有权验证
   - 转让限制

2. 赔付安全
   - 多重数据源验证
   - 赔付金额验证
   - 重复赔付防护

3. 紧急机制
   - 合约暂停
   - 紧急赎回
   - 参数调整 