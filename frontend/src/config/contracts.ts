/**
 * HashCAT智能合约配置
 * 包含部署在Sui测试网上的各种合约地址与基本配置信息
 */

// 测试代币合约配置
export const TEST_TOKENS_CONTRACT = {
  PACKAGE_ID: "0x9ffc848c647ece52a2e2eb9c81b430fd09a778d1cba2fab01a370831a2212bd9",
  TEST_BTC: {
    METADATA_ID: "0x5e4b3ebdf804b72f90c9f710c5652f5b3c14f4c70a7e86e7b47480418f516519",
    MINT_CAP_ID: "0xd63f68bddd2938b994cf7e86fe3c7f7ed17bf79121c6343dc44d9b6b89784e56",
    MODULE: "test_btc",
    SYMBOL: "testBTC",
    DECIMALS: 6,
    COIN_TYPE: "0x9ffc848c647ece52a2e2eb9c81b430fd09a778d1cba2fab01a370831a2212bd9::test_btc::TEST_BTC"
  },
  TEST_SUI: {
    METADATA_ID: "0xcfe76cd54f9f7a4a3ba40dd517e31ec41ff119f6d66dee755bfc81913c26c5f3",
    MINT_CAP_ID: "0x9177dc9116450ecb6cbb9e376ce1db7edf3dc2d6b57f270446d4f830bfa5a34e",
    MODULE: "test_sui",
    SYMBOL: "testSUI",
    DECIMALS: 6,
    COIN_TYPE: "0x9ffc848c647ece52a2e2eb9c81b430fd09a778d1cba2fab01a370831a2212bd9::test_sui::TEST_SUI"
  },
  UPGRADE_CAP_ID: "0x8eaa02c6f2c0cbb27fda7cc6b9911dfa685d3508049273f54237655d852e7fc5"
};

// SWAP合约配置
export const SWAP_CONTRACT = {
  PACKAGE_ID: "0xd3b528bf04e77b0f9842431799387cb8cdbe329fc03fcb648ff32634d673ddbb",
  TEST_BTC: {
    METADATA_ID: "0xe18990c3a0c37108941c62369d86da4399cb770e4a5d09305cca239c991e6a59",
    MINT_CAP_ID: "0x21682827efd2b384fcecc506e1fbfa2b5c60e26fa21b5463cce83df1e2443c51",
    MODULE: "test_btc",
    SYMBOL: "testBTC",
    DECIMALS: 6,
    COIN_TYPE: "0xd3b528bf04e77b0f9842431799387cb8cdbe329fc03fcb648ff32634d673ddbb::test_btc::TEST_BTC"
  },
  TEST_SUI: {
    METADATA_ID: "0x55546cfebcebdc041d215cd4149bb7e121d844ca3ba543b7c004ffbf516f896b",
    MINT_CAP_ID: "0x1c5d82edca77a3c80837aaeb638018bb50adc4742d947d75cc8b672938b5cbbb",
    MODULE: "test_sui",
    SYMBOL: "testSUI",
    DECIMALS: 6,
    COIN_TYPE: "0xd3b528bf04e77b0f9842431799387cb8cdbe329fc03fcb648ff32634d673ddbb::test_sui::TEST_SUI"
  },
  SWAP: {
    MODULE: "move_swap",
    FEE_PERCENT: 30, // 0.3% 费率
    FUNCTIONS: {
      CREATE_POOL: "create_pool",
      ADD_LIQUIDITY: "add_liquidity",
      REMOVE_LIQUIDITY: "remove_liquidity_entry",
      SWAP: "swap",
      SWAP_REVERSE: "swap_reverse"
    }
  },
  UPGRADE_CAP_ID: "0x8aed6b0e33fb15e04af2ce20ad0982ee441b628c3cfd830d6c8a93d8fa6877a4"
};

// 保险合约配置
export const INSURANCE_CONTRACT = {
  PACKAGE_ID: "0x7434e311a7faab19d6e7d483bbdc51936910c278e0f8526a805e1fe63fafc990", // 保险合约地址
  INSURANCE: {
    MODULE: "insurance",
    FUNCTIONS: {
      CREATE_POLICY: "mint_insurance",
      CLAIM: "claim",
      REDEEM: "redeem",
      UPDATE_BASE_RATE: "update_base_rate",
      UPDATE_VOLATILITY: "update_volatility"
    }
  },
  INSURANCE_NFT: {
    MODULE: "insurance_nft",
    FUNCTIONS: {
      MINT: "mint"
    }
  },
  POLICY_MANAGER_ID: "0x05a96c19dca85e5d45e814080b8dc72ca434b6f553538d3277743e1f60a8450e", // PolicyManager对象ID
  ADMIN_CAP_ID: "0x7d87c83c2f71bb9388262c06f0eec7b57ee651bf1892a7a6fd6f1b1b931ac7fc", // 管理员地址
  UPGRADE_CAP_ID: "0x9bca6e5d1c5bd3e1e988e2244b6adf68bfc7ef3fc0fd7f29de4e0902823c1f1f" // 升级权限ID
};

// 网络配置
export const NETWORK_CONFIG = {
  RPC_URLS: {
    devnet: "https://fullnode.devnet.sui.io",
    testnet: "https://fullnode.testnet.sui.io",
    mainnet: "https://fullnode.mainnet.sui.io"
  },
  EXPLORERS: {
    devnet: "https://suiexplorer.com/?network=devnet",
    testnet: "https://suiexplorer.com/?network=testnet",
    mainnet: "https://suiexplorer.com"
  },
  ENV: {
    DEVNET: "devnet",
    TESTNET: "testnet", 
    MAINNET: "mainnet"
  },
  DEFAULT: "testnet" // 默认使用测试网
}; 