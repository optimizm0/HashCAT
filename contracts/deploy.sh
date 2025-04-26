#!/bin/bash

# HashCAT 合约部署脚本
# 用于部署 coin、insurance 和 pool 合约

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# 时间戳
TIMESTAMP=$(date +"%Y-%m-%d")

# 管理员地址
ADMIN_ADDRESS=$(sui client active-address)
echo -e "${YELLOW}使用管理员地址: $ADMIN_ADDRESS${NC}"

# 创建部署日志目录
DEPLOY_LOG_DIR="./deploy_logs"
DEPLOY_LOG="$DEPLOY_LOG_DIR/deploy_log_$TIMESTAMP.json"
mkdir -p $DEPLOY_LOG_DIR

# 更新合约部署记录
update_deploy_records() {
    local package_name=$1
    local package_id=$2
    local deploy_tx=$3
    local modules=$4
    local resources=$5
    local gas_cost=$6
    
    # 更新历史部署记录文件
    # 将当前部署记录添加到history文件顶部
    cp contract_deploy_history.md contract_deploy_history.md.bak
    {
        echo "# 历史合约部署记录"
        echo ""
        echo "## $package_name 合约部署记录"
        echo "**部署时间**: $TIMESTAMP"
        echo "**网络**: Sui Testnet"
        echo "**部署交易**: \`$deploy_tx\`"
        echo ""
        echo "### 合约地址"
        echo "- **Package ID**: \`$package_id\`"
        echo "- **Package 版本**: 1"
        echo "- **模块列表**:"
        for module in $modules; do
            echo "  - \`$module\`"
        done
        echo ""
        echo "$resources"
        echo ""
        echo "### 部署成本"
        echo "$gas_cost"
        echo ""
        echo "### 验证步骤"
        echo "1. 在 Sui Explorer 中查看交易："
        echo "   \`\`\`"
        echo "   https://suiexplorer.com/txblock/$deploy_tx"
        echo "   \`\`\`"
        echo ""
        cat contract_deploy_history.md.bak | tail -n +1
    } > contract_deploy_history.md
    rm contract_deploy_history.md.bak
    
    # 更新最新部署记录文件
    # 替换或添加部分内容
    if grep -q "## $package_name 合约" contract_deploy_newest.md; then
        # 如果已存在该合约部分，替换它
        sed -i.bak "/## $package_name 合约/,/## /{ /## /!d; }" contract_deploy_newest.md
        sed -i.bak "/## $package_name 合约/a\\
**部署时间**: $TIMESTAMP\\
**网络**: Sui Testnet\\
**部署交易**: \`$deploy_tx\`\\
\\
### 合约地址\\
- **Package ID**: \`$package_id\`\\
- **Package 版本**: 1\\
- **模块列表**:\\
$(for module in $modules; do echo "  - \`$module\`"; done)\\
\\
$resources\\
\\
### 部署成本\\
$gas_cost\\
\\
### 验证步骤\\
1. 在 Sui Explorer 中查看交易：\\
   \`\`\`\\
   https://suiexplorer.com/txblock/$deploy_tx\\
   \`\`\`\\
" contract_deploy_newest.md
        rm contract_deploy_newest.md.bak
    else
        # 如果不存在，添加到文件末尾
        echo "" >> contract_deploy_newest.md
        echo "## $package_name 合约" >> contract_deploy_newest.md
        echo "**部署时间**: $TIMESTAMP" >> contract_deploy_newest.md
        echo "**网络**: Sui Testnet" >> contract_deploy_newest.md
        echo "**部署交易**: \`$deploy_tx\`" >> contract_deploy_newest.md
        echo "" >> contract_deploy_newest.md
        echo "### 合约地址" >> contract_deploy_newest.md
        echo "- **Package ID**: \`$package_id\`" >> contract_deploy_newest.md
        echo "- **Package 版本**: 1" >> contract_deploy_newest.md
        echo "- **模块列表**:" >> contract_deploy_newest.md
        for module in $modules; do
            echo "  - \`$module\`" >> contract_deploy_newest.md
        done
        echo "" >> contract_deploy_newest.md
        echo "$resources" >> contract_deploy_newest.md
        echo "" >> contract_deploy_newest.md
        echo "### 部署成本" >> contract_deploy_newest.md
        echo "$gas_cost" >> contract_deploy_newest.md
        echo "" >> contract_deploy_newest.md
        echo "### 验证步骤" >> contract_deploy_newest.md
        echo "1. 在 Sui Explorer 中查看交易：" >> contract_deploy_newest.md
        echo "   \`\`\`" >> contract_deploy_newest.md
        echo "   https://suiexplorer.com/txblock/$deploy_tx" >> contract_deploy_newest.md
        echo "   \`\`\`" >> contract_deploy_newest.md
    fi
    
    echo -e "${GREEN}部署记录已更新到contract_deploy_newest.md和contract_deploy_history.md${NC}"
}

# 解析部署输出中的对象ID
extract_object_id() {
    local output=$1
    local pattern=$2
    echo "$output" | grep -A 5 "$pattern" | grep -oE "Object ID: 0x[a-f0-9]+" | head -1 | awk '{print $3}'
}

# 解析Gas成本
extract_gas_cost() {
    local output=$1
    local computation=$(echo "$output" | grep "Computation Cost:" | awk '{print $3}')
    local storage=$(echo "$output" | grep "Storage Cost:" | awk '{print $3}')
    local rebate=$(echo "$output" | grep "Storage Rebate:" | awk '{print $3}')
    local non_refundable=$(echo "$output" | grep "Non-refundable Storage Fee:" | awk '{print $3}')
    
    local total=$(( $computation + $storage - $rebate + $non_refundable ))
    
    echo "- 计算成本: $computation gas"
    echo "- 存储成本: $storage gas"
    echo "- 存储返还: $rebate gas"
    echo "- 不可退还费用: $non_refundable gas"
    echo "- 总花费: $total gas"
}

# 部署合约
deploy_contract() {
    local package_dir=$1
    local package_name=$2
    local gas_budget=200000000
    
    echo -e "${BLUE}====== 开始部署 $package_name 合约 ======${NC}"
    
    # 切换到合约目录
    cd $package_dir
    
    # 编译并部署合约
    echo -e "${YELLOW}编译并部署 $package_name 合约...${NC}"
    local deploy_output=$(sui client publish --gas-budget $gas_budget 2>&1)
    local deploy_status=$?
    
    # 检查部署状态
    if [ $deploy_status -ne 0 ]; then
        echo -e "${RED}部署失败: ${NC}"
        echo "$deploy_output"
        cd ..
        return 1
    fi
    
    echo -e "${GREEN}部署成功!${NC}"
    
    # 提取部署交易 Digest
    local deploy_tx=$(echo "$deploy_output" | grep -oE "Transaction Digest: [a-zA-Z0-9]+" | awk '{print $3}')
    
    # 提取 Package ID
    local package_id=$(echo "$deploy_output" | grep -A 3 "Created Objects:" | grep -oE "0x[a-f0-9]+" | head -1)
    
    # 提取模块列表
    local modules=$(echo "$deploy_output" | grep "Published" | grep -oE '[a-zA-Z_]+::' | sed 's/:://g')
    
    # 提取资源信息，根据合约类型定制
    local resources=""
    local upgrade_cap_id=$(extract_object_id "$deploy_output" "UpgradeCap")
    
    case $package_name in
        "Coin")
            # 提取代币相关对象
            local btc_metadata_id=$(extract_object_id "$deploy_output" "CoinMetadata<.*::test_btc::TEST_BTC")
            local btc_treasury_id=$(extract_object_id "$deploy_output" "TreasuryCap<.*::test_btc::TEST_BTC")
            local sui_metadata_id=$(extract_object_id "$deploy_output" "CoinMetadata<.*::test_sui::TEST_SUI")
            local sui_treasury_id=$(extract_object_id "$deploy_output" "TreasuryCap<.*::test_sui::TEST_SUI")
            
            resources="### TEST_BTC 代币
1. **代币元数据**:
   - Object ID: \`$btc_metadata_id\`
   - 所有者: Immutable
   - 精度: 6
   - 符号: testBTC

2. **铸币权限**:
   - Object ID: \`$btc_treasury_id\`
   - 所有者: \`$ADMIN_ADDRESS\`

### TEST_SUI 代币
1. **代币元数据**:
   - Object ID: \`$sui_metadata_id\`
   - 所有者: Immutable
   - 精度: 6
   - 符号: testSUI

2. **铸币权限**:
   - Object ID: \`$sui_treasury_id\`
   - 所有者: \`$ADMIN_ADDRESS\`

### 升级权限
- **UpgradeCap**:
  - Object ID: \`$upgrade_cap_id\`
  - 所有者: \`$ADMIN_ADDRESS\`"
            ;;
            
        "Insurance")
            # 提取保险合约对象
            local policy_manager_id=$(extract_object_id "$deploy_output" "PolicyManager")
            
            resources="### 保险管理者对象
1. **PolicyManager**:
   - Object ID: \`$policy_manager_id\`
   - 所有者: Shared
   - 基准费率: 2%
   - 波动性系数: 5%
   - 管理员: \`$ADMIN_ADDRESS\`

### 升级权限
- **UpgradeCap**:
  - Object ID: \`$upgrade_cap_id\`
  - 所有者: \`$ADMIN_ADDRESS\`"
            ;;
            
        "Pool")
            # 提取流动性池对象
            local pool_factory_id=$(extract_object_id "$deploy_output" "PoolFactory")
            
            resources="### 流动性池工厂对象
1. **PoolFactory**:
   - Object ID: \`$pool_factory_id\`
   - 所有者: Shared
   - 管理员: \`$ADMIN_ADDRESS\`

### 升级权限
- **UpgradeCap**:
  - Object ID: \`$upgrade_cap_id\`
  - 所有者: \`$ADMIN_ADDRESS\`"
            ;;
    esac
    
    # 提取Gas成本
    local gas_cost=$(extract_gas_cost "$deploy_output")
    
    # 返回到原目录
    cd ..
    
    # 更新部署记录
    update_deploy_records "$package_name" "$package_id" "$deploy_tx" "$modules" "$resources" "$gas_cost"
    
    # 保存完整部署记录
    echo "$deploy_output" > "$DEPLOY_LOG_DIR/${package_name}_deploy_$TIMESTAMP.log"
    
    # 保存关键信息到JSON日志
    jq -n \
      --arg timestamp "$TIMESTAMP" \
      --arg package_name "$package_name" \
      --arg package_id "$package_id" \
      --arg deploy_tx "$deploy_tx" \
      --arg upgrade_cap_id "$upgrade_cap_id" \
      '{timestamp: $timestamp, package_name: $package_name, package_id: $package_id, deploy_tx: $deploy_tx, upgrade_cap_id: $upgrade_cap_id}' \
      >> "$DEPLOY_LOG"
    
    echo -e "${BLUE}====== $package_name 合约部署完成 ======${NC}\n"
}

# 主函数
main() {
    echo -e "${BLUE}开始部署 HashCAT 合约...${NC}"
    echo -e "${YELLOW}部署日志将保存到 $DEPLOY_LOG${NC}"
    
    # 确保部署记录文件存在
    touch contract_deploy_newest.md
    touch contract_deploy_history.md
    
    # 首先部署Coin合约
    deploy_contract "./coin" "Coin"
    [ $? -ne 0 ] && echo -e "${RED}Coin合约部署失败，中止部署流程${NC}" && exit 1
    
    # 部署保险合约
    deploy_contract "./insurance" "Insurance"
    [ $? -ne 0 ] && echo -e "${RED}Insurance合约部署失败，但继续部署下一个合约${NC}"
    
    # 部署流动性池合约
    deploy_contract "./pool" "Pool"
    [ $? -ne 0 ] && echo -e "${RED}Pool合约部署失败${NC}"
    
    echo -e "${GREEN}所有合约部署完成!${NC}"
    echo -e "${YELLOW}部署日志已保存到 $DEPLOY_LOG_DIR 目录${NC}"
}

# 执行主函数
main 