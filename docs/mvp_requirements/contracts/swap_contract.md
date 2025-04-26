# 代币兑换合约规范 (Swap)
**Version: MVP-v1.0** | **Last Updated: 2024-03-22**

## 一、合约概述
代币兑换合约实现 sBTC 和 SUI 等代币之间的自动化兑换功能，基于 AMM 机制提供流动性。

## 二、核心功能
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

## 三、事件定义
- `SwapEvent`: 代币兑换事件
  - 记录输入代币类型、数量
  - 记录输出代币类型、数量
  - 记录交易时间戳、用户地址
- `LiquidityAddedEvent`: 添加流动性事件
  - 记录添加的代币对和数量
  - 记录铸造的 LP 代币数量
- `LiquidityRemovedEvent`: 移除流动性事件
  - 记录销毁的 LP 代币数量
  - 记录返还的代币数量

## 四、价格机制
1. 恒定乘积做市商模型 (AMM)
   ```move
   // x * y = k
   let k = reserve_x * reserve_y;
   let y = k / (reserve_x + amount_in);
   ```

2. Chainlink 预言机集成
   - 实时价格数据更新
   - 价格偏差检查
   - 数据源验证

3. 滑点保护
   - 最小输出金额检查
   - 价格影响计算
   - 交易超时机制

## 五、错误处理
```move
const ERROR_INSUFFICIENT_LIQUIDITY: u64 = 1;
const ERROR_INSUFFICIENT_INPUT: u64 = 2;
const ERROR_INSUFFICIENT_OUTPUT: u64 = 3;
const ERROR_INVALID_PAIR: u64 = 4;
const ERROR_PRICE_IMPACT_TOO_HIGH: u64 = 5;
const ERROR_EXPIRED: u64 = 6;
```

## 六、限制与约束
1. 交易限制
   - 最小交易金额: 0.0001 sBTC
   - 最大价格影响: 5%
   - 交易超时时间: 5 分钟

2. 流动性限制
   - 最小流动性提供: 0.001 sBTC
   - LP 代币精度: 8 位小数
   - 提取冷却期: 24 小时

## 七、手续费机制
1. 交易手续费
   - 基础费率: 0.3%
   - 协议费用: 0.05%
   - LP 奖励: 0.25%

2. 流动性提供奖励
   - 交易费分成
   - 流动性挖矿奖励
   - 长期质押奖励

## 八、紧急机制
1. 交易暂停
2. 紧急提款
3. 参数调整权限 