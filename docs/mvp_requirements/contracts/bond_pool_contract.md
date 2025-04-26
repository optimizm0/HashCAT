# 债券池合约规范 (BondPool)
**Version: MVP-v1.0** | **Last Updated: 2024-03-22**

## 一、合约概述
债券池合约管理保险资金池，提供固定收益质押功能，支持保险赔付资金储备。

## 二、核心功能
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

## 三、事件定义
- `StakeEvent`: 质押事件
  - 记录质押金额、期限
  - 记录质押者地址、时间戳
  - Stake ID
- `UnstakeEvent`: 赎回事件
  - 记录赎回金额、收益
  - 记录接收地址、时间戳
- `RewardClaimEvent`: 收益提取事件
  - 记录提取金额、收益率
  - 记录质押 ID、时间戳

## 四、质押凭证
```move
struct StakeInfo has key {
    id: ID,
    amount: u64,           // 质押金额
    start_time: u64,       // 开始时间
    duration: u64,         // 锁定期限
    apy: u64,             // 年化收益率
    last_claim_time: u64,  // 上次提取时间
    owner: address,        // 所有者地址
}
```

## 五、收益机制
1. 固定 APY 计算
   ```move
   // 收益计算公式
   let time_elapsed = current_time - last_claim_time;
   let reward = (amount * apy * time_elapsed) / (365 * 24 * 60 * 60 * 10000);
   ```

2. 线性释放
   - 每秒计算收益
   - 按时间比例释放
   - 支持随时提取

3. 锁定期管理
   - 不同期限对应不同 APY
   - 提前赎回惩罚机制
   - 自动续期选项

## 六、错误处理
```move
const ERROR_INSUFFICIENT_AMOUNT: u64 = 1;
const ERROR_INVALID_DURATION: u64 = 2;
const ERROR_STAKE_NOT_FOUND: u64 = 3;
const ERROR_NOT_OWNER: u64 = 4;
const ERROR_STILL_LOCKED: u64 = 5;
const ERROR_NO_REWARD: u64 = 6;
```

## 七、限制与约束
1. 质押参数
   - 最小质押金额: 0.1 sBTC
   - 最短锁定期: 7 天
   - 最长锁定期: 365 天

2. 收益参数
   - 基础年化: 5%
   - 最高年化: 15%
   - 最低年化: 3%

3. 池子限制
   - 最大池子容量: 1000 sBTC
   - 单用户最大质押: 100 sBTC
   - 最小提取金额: 0.01 sBTC

## 八、安全机制
1. 资金安全
   - 多重签名管理
   - 提现限额控制
   - 紧急暂停机制

2. 收益保护
   - 收益率上限
   - 通胀控制
   - 资金池平衡

3. 治理功能
   - 参数调整权限
   - 紧急提款机制
   - 升级权限管理 