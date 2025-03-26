# HashCAT 系统架构设计文档
**Version: v1.0.0** | **Last Updated: 2024-03-22**

## 一、系统整体架构

### 1.1 系统架构图
```mermaid
graph TB
    subgraph Layer1[区块链层]
        SC[智能合约]
        OR[预言机网络]
    end
    
    subgraph Layer2[服务层]
        API[API网关]
        WS[WebSocket服务]
        Cache[缓存服务]
    end
    
    subgraph Layer3[应用层]
        FE[前端应用]
        Admin[管理后台]
    end
    
    subgraph Layer4[外部系统]
        BTC[比特币网络]
        Chainlink[Chainlink预言机]
        IPFS[IPFS存储]
    end
    
    FE --> API
    FE --> WS
    API --> SC
    API --> Cache
    WS --> OR
    OR --> Chainlink
    SC --> BTC
    SC --> IPFS
```

### 1.2 技术栈选型
- **区块链层**：Sui Network
- **服务层**：Node.js + TypeScript
- **应用层**：React + TypeScript
- **存储层**：IPFS + MongoDB
- **消息队列**：Redis Pub/Sub
- **监控系统**：Prometheus + Grafana

## 二、区块链架构设计

### 2.1 Sui链特性利用
- **对象模型**：利用Sui的全局对象存储模型存储保险NFT
- **并行执行**：利用Sui的并行交易处理能力优化AMM操作
- **共享对象**：使用共享对象实现债券池的全局状态管理
- **时钟对象**：利用Sui Clock实现时间锁和赔付验证

### 2.2 智能合约架构
```mermaid
graph LR
    subgraph Contracts[智能合约组]
        direction TB
        INS[保险合约]
        BND[债券合约]
        ACT[精算合约]
        ORC[预言机合约]
    end
    
    INS --> BND
    INS --> ACT
    ACT --> ORC
    BND --> ORC
```

### 2.3 合约交互流程
```mermaid
sequenceDiagram
    participant User
    participant Insurance
    participant Actuarial
    participant Oracle
    participant Bond
    
    User->>Insurance: 发起投保
    Insurance->>Actuarial: 请求保费计算
    Actuarial->>Oracle: 获取实时数据
    Oracle-->>Actuarial: 返回数据
    Actuarial-->>Insurance: 计算保费
    Insurance->>Bond: 创建债券
    Bond-->>Insurance: 确认债券
    Insurance-->>User: 完成投保
```

## 三、数据流设计

### 3.1 核心数据流
```mermaid
graph LR
    subgraph DataFlow[数据流向]
        direction TB
        Raw[原始数据] --> Process[数据处理]
        Process --> Store[数据存储]
        Store --> Cache[缓存层]
        Cache --> API[API服务]
        API --> Client[客户端]
    end
```

### 3.2 数据模型
```mermaid
erDiagram
    INSURANCE ||--o{ POLICY : contains
    POLICY ||--o{ CLAIM : has
    BONDPOOL ||--o{ BOND : issues
    USER ||--o{ POLICY : owns
    USER ||--o{ BOND : holds
```

## 四、前后端交互设计

### 4.1 API设计
```mermaid
graph TB
    subgraph API[API接口]
        direction LR
        REST[REST API]
        WS[WebSocket]
        GraphQL[GraphQL]
    end
    
    subgraph Auth[认证]
        JWT[JWT认证]
        Wallet[钱包认证]
    end
    
    REST --> Auth
    WS --> Auth
    GraphQL --> Auth
```

### 4.2 实时数据流
```mermaid
sequenceDiagram
    participant Client
    participant WS
    participant Cache
    participant Oracle
    
    Client->>WS: 订阅数据
    WS->>Cache: 获取缓存
    Cache->>Oracle: 请求更新
    Oracle-->>Cache: 推送数据
    Cache-->>WS: 更新缓存
    WS-->>Client: 推送数据
```

## 五、安全架构

### 5.1 安全层级
```mermaid
graph TB
    subgraph Security[安全架构]
        direction LR
        Network[网络安全]
        App[应用安全]
        Data[数据安全]
        Contract[合约安全]
    end
    
    Network --> App
    App --> Data
    App --> Contract
```

### 5.2 关键安全措施
- 多重签名机制
- 时间锁机制
- 预言机数据验证
- 合约升级控制
- 访问控制策略

## 六、扩展性设计

### 6.1 水平扩展
```mermaid
graph LR
    subgraph Scaling[扩展架构]
        direction TB
        LB[负载均衡]
        API1[API实例1]
        API2[API实例2]
        Cache1[缓存1]
        Cache2[缓存2]
    end
    
    LB --> API1
    LB --> API2
    API1 --> Cache1
    API2 --> Cache2
```

### 6.2 垂直扩展
- 合约优化
- 数据库分片
- 缓存策略
- 异步处理

## 七、监控告警

### 7.1 监控指标
- 合约调用频率
- 预言机延迟
- 系统响应时间
- 错误率统计
- 资源使用率

### 7.2 告警策略
- 多级告警阈值
- 告警聚合
- 自动恢复机制
- 人工介入流程 