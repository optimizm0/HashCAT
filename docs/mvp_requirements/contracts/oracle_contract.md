# 数据验证合约规范 (Oracle)
**Version: MVP-v1.0** | **Last Updated: 2024-03-22**

## 一、合约概述
数据验证合约负责管理和验证外部数据源，包括比特币算力数据和代币价格数据，为其他合约提供可靠的数据支持。

## 二、核心功能
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

## 三、事件定义
- `HashrateUpdateEvent`: 算力更新事件
  - 记录算力值、时间戳
  - 记录数据源、签名信息
- `PriceUpdateEvent`: 价格更新事件
  - 记录代币类型、价格
  - 记录时间戳、数据源
- `VolatilityAlertEvent`: 波动预警事件
  - 记录波动幅度、时间段
  - 记录触发条件、影响范围

## 四、数据结构
```move
struct HashrateData has store {
    value: u64,            // 算力值
    timestamp: u64,        // 时间戳
    source: address,       // 数据源
    signature: vector<u8>, // 签名
}

struct PriceData has store {
    token: TypeName,       // 代币类型
    price: u64,           // 价格
    timestamp: u64,       // 时间戳
    source: address,      // 数据源
    signature: vector<u8>, // 签名
}
```

## 五、验证机制
1. 数据更新周期
   - 算力数据: 5分钟
   - 价格数据: 1分钟
   - 历史数据保留: 24小时

2. 数据验证规则
   - 签名验证
   - 时间戳检查
   - 数值范围验证

3. 波动监控
   - 算力下跌检测
   - 价格波动监控
   - 异常值过滤

## 六、错误处理
```move
const ERROR_INVALID_DATA: u64 = 1;
const ERROR_INVALID_TIMESTAMP: u64 = 2;
const ERROR_INVALID_SIGNATURE: u64 = 3;
const ERROR_UNAUTHORIZED_SOURCE: u64 = 4;
const ERROR_DATA_TOO_OLD: u64 = 5;
const ERROR_INVALID_INTERVAL: u64 = 6;
```

## 七、限制与约束
1. 数据源限制
   - 授权数据源列表
   - 最少数据源数量: 3
   - 数据一致性要求: 2/3

2. 时间限制
   - 数据最大延迟: 10分钟
   - 最小更新间隔: 1分钟
   - 历史数据过期: 24小时

3. 值范围限制
   - 算力最大变化: 30%
   - 价格最大变化: 20%
   - 异常值阈值: 3σ

## 八、安全机制
1. 数据安全
   - 多重签名验证
   - 数据加密传输
   - 防篡改机制

2. 访问控制
   - 数据源白名单
   - 更新权限管理
   - 查询权限控制

3. 应急机制
   - 数据回滚
   - 紧急暂停
   - 源切换机制

## 九、数据聚合
1. 算力数据
   - 移动平均值
   - 加权平均值
   - 异常值剔除

2. 价格数据
   - TWAP 计算
   - 中位数价格
   - 波动率计算 