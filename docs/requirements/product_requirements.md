**HashCAT MVP需求文档 v1.0**  
**最后更新：2025-03-22**  
**核心定位：基于比特币算力风险的链上保险协议**

---

### **一、产品定位**
1. **核心创新**  
   - 将比特币矿池算力波动风险转化为链上保险产品
   - 首创动态精算定价引擎（Dynamic Actuarial Engine）
   - 基于Sui区块链的分钟级赔付验证系统
   - BTC跨链桥接机制（待开发）

2. **差异化价值**  
   ```math
   V_{HashCAT} = \frac{(算力波动率 × 保额)}{(精算模型置信度 × 质押率)}
   ```
   通过该公式实现实时保费定价，较传统保险产品效率提升300%

---

### **二、核心功能模块**
#### **模块1：BTC跨链桥（待开发）**
- **功能描述**
  - 支持BTC到Sui的跨链转账
  - 实现BTC在Sui上的1:1锚定
  - 确保跨链安全性（多重签名机制）

#### **模块2：保险NFT铸造（Mint Insurance）**
- **功能描述**  
  - 矿工输入：算力设备ID（通过Chainlink矿池预言机验证）
  - 参数配置：保额（1-1000 BTC）、保障周期（7-90天）
  - 输出产物：保险NFT（含精算参数元数据）

- **技术规格**  
  ```move
  public entry fun mint_insurance(
      miner_id: vector<u8>,
      coverage: u64,
      duration: u64
  ) : InsuranceNFT {
      // 通过Sui Object模型创建保险NFT
  }
  ```

#### **模块3：债券池管理**
- **功能描述**
  - 基于总投保额动态调整债券池规模
  - 仅支持BTC购买和赎回
  - 债券池收益用于支付保险赔付

- **技术规格**
  ```move
  public entry fun update_bond_pool(
      total_insurance_amount: u64
  ) {
      // 根据总投保额更新债券池规模
  }
  ```

#### **模块4：动态精算引擎**
- **数据输入**  
  - 实时算力数据（30+矿池API聚合）
  - 比特币网络难度调整预测（LSTM神经网络模型）
  - 历史赔付率数据库（IPFS分布式存储）

- **算法逻辑**  
  ```python
  def premium_calculation(hashrate_volatility):
      # 基于GARCH模型预测未来30日波动率
      volatility = calculate_garch(hashrate_data)
      
      # 动态调整质押率（5分钟更新周期）
      collateral_ratio = 0.3 + (volatility - 0.15) * 2
      
      return {
          'premium_rate': volatility * 1.8,
          'payout_threshold': 15%  # 触发赔付的算力降幅
      }
  ```

#### **模块5：自动赔付系统**
- **触发条件**（需同时满足）  
  1. 连续2小时算力下降 ≥15%
  2. BTC价格未同步下跌（防止恶意索赔）
  3. 网络难度未发生预期外调整

- **赔付流程**  
  ```mermaid
  graph TD
    A[Chainlink算力预言机] --> B{触发条件?}
    B -->|Yes| C[调用Sui Clock验证时间锁]
    C --> D[验证保险NFT]
    D --> E[从债券池支付赔付]
  ```

---

### **四、技术架构**
```plaintext
Layer 1: Sui区块链（核心合约）
├── 智能合约组
│   ├── ActuarialEngine.move
│   ├── InsuranceNFT.move
│   ├── BondPool.move
│   └── PayoutOracle.move

Layer 2: 混合预言机网络
├── Chainlink矿池数据流
├-> 去中心化节点验证（30+矿池）
└-> 抗女巫攻击机制（PoRA共识）

Layer 3: 前端交互层
├── React dApp界面
├-> 三维算力波动可视化仪表盘
└-> MetaMask/Suiet钱包集成
```

---

### **五、经济模型设计**
1. **代币体系**  
   - $HCT（HashCAT Token）：治理+费用代币
   - 债券池收益分配：
     ```math
     Revenue_{pool} = 保费收入 × 85% - 赔付支出
     ```
     - 债券持有者：固定年化8-12%

2. **质押机制**  
   - 保险人需质押$HCT ≥ 保额的30%
   - 动态调整公式：
     ```math
     Collateral_{new} = Collateral_{old} × (1 + \frac{ΔHashrate}{10})
     ```
     当算力波动率每增加10%，质押率提升3%

---

### **六、风险评估与应对**
| 风险类型 | 发生概率 | 应对方案 |
|----------|----------|----------|
| 智能合约漏洞 | 5% | 采用Move语言形式化验证 + Halborn审计 |
| 预言机数据延迟 | 8% | 建立本地缓存节点 + 多预言机冗余 |
| 流动性挤兑 | 12% | 设置单日最大赔付限额（TVL的15%） |
| 跨链风险 | 15% | 多重签名机制 + 24小时时间锁 |

---

### **七、MVP开发路线图**
```gantt
    title HashCAT MVP里程碑
    section 基础架构
    Sui合约开发     :2025-03-25, 14d
    混合预言机搭建  :2025-04-05, 10d
    section 核心功能
    动态精算引擎    :2025-04-10, 21d
    债券池开发      :2025-04-15, 12d
    section 测试网
    压力测试       :2025-05-01, 7d
    白帽审计       :2025-05-05, 5d
    section 主网上线
    V1.0发布      :2025-05-15, 3d
```

---

### **八、MVP成功指标**
1. **基础指标**  
   - 100+活跃矿工投保
   - $5M TVL（保险池总锁定价值）
   - 平均赔付处理时间 < 15分钟

2. **扩展性指标**  
   - 开发3种精算模型变体（PoW/PoS/存储证明）
   - 实现BTC跨链桥接（Sui←→Bitcoin）

---

**注**：建议优先开发**保险NFT铸造+债券池系统**组合，该组合开发量占MVP总工作量的65%，但能验证90%的核心商业模式。如需进一步技术细节，可提供智能合约伪代码深度解析。