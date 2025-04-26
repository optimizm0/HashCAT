# 跨链桥合约规范 (Bridge)
**Version: MVP-v1.0** | **Last Updated: 2024-03-22**

## 一、合约概述
跨链桥合约负责 BTC 和 sBTC 之间的转换操作，确保资产的安全跨链转移。

## 二、核心功能
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

## 三、事件定义
- `BridgeMintEvent`: sBTC 铸造事件
  - 记录铸造数量、接收地址、时间戳
- `BridgeBurnEvent`: sBTC 销毁事件
  - 记录销毁数量、目标 BTC 地址、时间戳
- `AddressRegisteredEvent`: 地址映射注册事件
  - 记录 BTC 地址和 Sui 地址的映射关系

## 四、安全特性
1. 多重签名验证
   - 验证器节点签名
   - 阈值签名机制
   - 签名有效期检查

2. 交易证明验证
   - BTC 交易证明验证
   - 交易确认数验证
   - 金额匹配验证

3. 地址映射验证
   - 地址格式验证
   - 映射唯一性检查
   - 地址所有权验证

## 五、错误处理
```move
const ERROR_INVALID_AMOUNT: u64 = 1;
const ERROR_INVALID_ADDRESS: u64 = 2;
const ERROR_INVALID_PROOF: u64 = 3;
const ERROR_INVALID_SIGNATURE: u64 = 4;
const ERROR_INSUFFICIENT_SIGNATURES: u64 = 5;
const ERROR_ADDRESS_ALREADY_REGISTERED: u64 = 6;
```

## 六、限制与约束
1. 交易限制
   - 单笔最小金额: 0.01 BTC
   - 单笔最大金额: 10 BTC
   - 日累计限额: 100 BTC

2. 时间限制
   - BTC 交易确认数要求: 6 个确认
   - 签名有效期: 1 小时
   - 地址映射冷却期: 24 小时

## 七、升级机制
1. 合约升级权限控制
2. 参数调整机制
3. 紧急暂停功能 