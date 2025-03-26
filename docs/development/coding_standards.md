# HashCAT 开发规范文档
**Version: v1.0.0** | **Last Updated: 2024-03-22**

## 一、环境配置规范

### 1.1 网络环境
- 仅使用Sui测试网（Testnet）进行开发和测试
- 禁止在主网（Mainnet）上进行任何操作
- 测试网配置：
  ```toml
  [env]
  TESTNET_RPC_URL = "https://fullnode.testnet.sui.io:443"
  TESTNET_FAUCET_URL = "https://faucet.testnet.sui.io/gas"
  ```

### 1.2 开发工具
- Sui CLI工具
- Move Analyzer
- Sui Explorer（测试网版本）
- Sui Wallet（测试网版本）

## 二、Move语言开发规范

### 2.1 文件组织
```plaintext
sources/
├── modules/           # 核心业务模块
│   ├── insurance.move
│   ├── bond_pool.move
│   └── actuarial.move
├── utils/            # 工具函数
│   ├── math.move
│   └── validation.move
└── tests/            # 测试文件
    └── insurance_tests.move
```

### 2.2 命名规范
- **模块名**：小写字母，下划线分隔
- **函数名**：小写字母，下划线分隔
- **结构体名**：大驼峰命名
- **常量**：大写字母，下划线分隔
- **类型参数**：单字母大写（T, K, V等）

### 2.3 代码风格
```move
module hashcat::insurance {
    use sui::object::{Self, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // 常量定义
    const MIN_COVERAGE: u64 = 85;
    const MAX_PAYOUT: u64 = 1000;

    // 结构体定义
    struct InsurancePolicy<phantom T> has key {
        id: ID,
        coverage: u64,
        premium: u64,
        start_time: u64,
        end_time: u64,
    }

    // 函数定义
    public fun create_policy<T>(
        coverage: u64,
        premium: u64,
        ctx: &mut TxContext
    ): InsurancePolicy<T> {
        // 函数实现
    }
}
```

### 2.4 注释规范
```move
/// 创建新的保险保单
/// 
/// # Arguments
/// * `coverage` - 保险覆盖金额
/// * `premium` - 保费金额
/// * `ctx` - 交易上下文
/// 
/// # Returns
/// * `InsurancePolicy<T>` - 新创建的保单
/// 
/// # Aborts
/// * 如果覆盖金额小于最小要求
public fun create_policy<T>(
    coverage: u64,
    premium: u64,
    ctx: &mut TxContext
): InsurancePolicy<T> {
    // 实现代码
}
```

### 2.5 测试规范
```move
#[test_only]
module hashcat::insurance_tests {
    use sui::test_scenario;
    use hashcat::insurance;

    #[test]
    fun test_create_policy() {
        let scenario = test_scenario::begin(@0x1);
        // 测试代码
        test_scenario::end(scenario);
    }
}
```

## 三、Sui链特定规范

### 3.1 对象模型规范
```move
// 使用共享对象
struct SharedPool has key {
    id: ID,
    total_liquidity: u64,
    // 其他字段
}

// 使用可转移对象
struct TransferableNFT has key {
    id: ID,
    metadata: String,
    // 其他字段
}

// 使用时钟对象
struct TimeBasedPolicy has key {
    id: ID,
    start_time: u64,
    // 其他字段
}
```

### 3.2 事件规范
```move
// 事件定义
struct PolicyCreatedEvent has copy, drop {
    policy_id: ID,
    coverage: u64,
    premium: u64,
}

// 事件触发
event::emit(PolicyCreatedEvent {
    policy_id: object::id(&policy),
    coverage,
    premium,
});
```

### 3.3 权限控制
```move
// 访问控制修饰器
fun only_admin(ctx: &TxContext) {
    assert!(tx_context::sender(ctx) == @admin_address, 0);
}

// 权限检查函数
public fun admin_only_function(ctx: &mut TxContext) {
    only_admin(ctx);
    // 函数实现
}
```

## 四、React开发规范

### 4.1 项目结构
```plaintext
src/
├── components/        # 可复用组件
│   ├── common/       # 通用组件
│   └── features/     # 功能组件
├── hooks/            # 自定义Hooks
├── pages/            # 页面组件
├── services/         # API服务
├── store/            # 状态管理
├── types/            # TypeScript类型
└── utils/            # 工具函数
```

### 4.2 组件规范
```typescript
// 组件命名：大驼峰
// 文件命名：组件名.tsx
import React from 'react';
import { useWallet } from '@suiet/wallet-kit';

interface InsuranceCardProps {
  policyId: string;
  coverage: number;
  premium: number;
}

export const InsuranceCard: React.FC<InsuranceCardProps> = ({
  policyId,
  coverage,
  premium,
}) => {
  const { connected, account } = useWallet();

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">保单详情</h3>
      {/* 组件内容 */}
    </div>
  );
};
```

### 4.3 Hooks规范
```typescript
// Hook命名：use前缀
// 文件命名：useHook名.ts
import { useState, useEffect } from 'react';

export const useInsurancePolicy = (policyId: string) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        // 获取保单数据
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [policyId]);

  return { policy, loading, error };
};
```

### 4.4 状态管理规范
```typescript
// 使用Zustand进行状态管理
import create from 'zustand';

interface InsuranceStore {
  policies: Policy[];
  selectedPolicy: Policy | null;
  setPolicies: (policies: Policy[]) => void;
  selectPolicy: (policy: Policy) => void;
}

export const useInsuranceStore = create<InsuranceStore>((set) => ({
  policies: [],
  selectedPolicy: null,
  setPolicies: (policies) => set({ policies }),
  selectPolicy: (policy) => set({ selectedPolicy: policy }),
}));
```

### 4.5 样式规范
```typescript
// 使用TailwindCSS
// 组件样式示例
const Card = () => (
  <div className="
    rounded-lg 
    border 
    border-gray-200 
    p-4 
    shadow-sm 
    hover:shadow-md 
    transition-shadow
  ">
    {/* 组件内容 */}
  </div>
);
```

### 4.6 测试规范
```typescript
// 使用Jest和React Testing Library
import { render, screen } from '@testing-library/react';
import { InsuranceCard } from './InsuranceCard';

describe('InsuranceCard', () => {
  it('renders policy details correctly', () => {
    render(
      <InsuranceCard
        policyId="123"
        coverage={1000}
        premium={100}
      />
    );

    expect(screen.getByText('保单详情')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
});
```

## 五、测试网开发规范

### 5.1 测试网部署流程
1. 合约部署
   ```bash
   # 部署到测试网
   sui client publish --gas-budget 10000000 --network testnet
   ```

2. 测试网验证
   - 使用Sui Explorer（测试网）验证交易
   - 检查合约对象创建
   - 验证事件触发

3. 测试网交互
   - 使用测试网钱包
   - 使用测试网RPC节点
   - 使用测试网水龙头获取测试代币

### 5.2 测试网测试规范
1. 单元测试
   ```bash
   # 运行所有测试
   sui move test
   ```

2. 集成测试
   - 使用测试网环境
   - 模拟真实用户场景
   - 验证跨链功能

3. 性能测试
   - 测试网TPS测试
   - 延迟测试
   - 并发测试

### 5.3 测试网监控
1. 交易监控
   - 使用Sui Explorer监控交易
   - 设置交易告警
   - 记录错误日志

2. 性能监控
   - 监控合约调用频率
   - 监控gas消耗
   - 监控响应时间

## 六、通用开发规范

### 6.1 Git提交规范
```plaintext
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

### 6.2 代码审查清单
- [ ] 代码符合项目规范
- [ ] 包含必要的测试
- [ ] 文档已更新
- [ ] 性能影响已评估
- [ ] 安全性已考虑

### 6.3 文档规范
- 所有公共API必须有文档
- 复杂逻辑必须有注释
- 配置变更必须记录
- 部署步骤必须文档化

### 6.4 性能规范
- 合约gas优化
- 前端性能指标
- 缓存策略
- 资源加载优化 