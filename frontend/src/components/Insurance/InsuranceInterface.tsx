import React, { useState, useEffect } from 'react';
import {
  Box, 
  Card, 
  Typography, 
  TextField, 
  Button, 
  styled, 
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
  ConnectButton,
} from '@mysten/dapp-kit';
import { TOKENS } from '../../config/tokens';
import { INSURANCE_CONTRACT } from '../../config/contracts';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { getCountryHistoricalData } from '../Explore/countryData';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: '100%',
  margin: '20px auto',
  padding: '24px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 500,
}));

// 定义保险产品类型
interface InsuranceProduct {
  id: string;
  name: string;
  description: string;
  icon: string;
  coverage: number;
  minDuration: number;
  maxDuration: number;
}

// 保险产品列表
const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'btc_hashrate',
    name: 'BTC算力波动保险',
    description: '',
    icon: 'BTC',
    coverage: 0.8, // 80%保障
    minDuration: 7, // 最少7天
    maxDuration: 90 // 最多90天
  }
];

interface InsuranceInterfaceProps {
  country?: string;  // 国家参数
  compact?: boolean; // 是否使用紧凑版本
}

const InsuranceInterface: React.FC<InsuranceInterfaceProps> = ({ country = '全球', compact = false }) => {
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct>(INSURANCE_PRODUCTS[0]);
  const [amount, setAmount] = useState('1000');
  const [duration, setDuration] = useState(30); // 保单持续天数
  const [premium, setPremium] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countryRiskFactor, setCountryRiskFactor] = useState(1.0); // 国家风险因子
  
  // Sui DApp Kit hooks
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  // Get token balance
  const token = TOKENS.find(t => t.symbol === 'sBTC')!;
  const tokenBalance = useTokenBalance(token);

  // 根据国家计算风险因子
  useEffect(() => {
    if (country) {
      // 获取国家历史算力数据
      const historyData = getCountryHistoricalData(country);
      
      if (historyData.length > 0) {
        // 计算算力波动率作为风险指标
        const recentData = historyData.slice(-12); // 取最近12个月数据
        if (recentData.length >= 2) {
          // 计算算力波动的标准差
          const hashrates = recentData.map(d => d.absoluteHashRate);
          const avg = hashrates.reduce((a, b) => a + b, 0) / hashrates.length;
          const variance = hashrates.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / hashrates.length;
          const stdDev = Math.sqrt(variance);
          
          // 算力波动率 = 标准差 / 平均值
          const volatility = stdDev / avg;
          
          // 风险因子根据波动率调整，波动率越高，风险越大，保费越高
          setCountryRiskFactor(1 + volatility);
          console.log(`国家 ${country} 的风险因子: ${1 + volatility}`);
        }
      } else {
        // 如果没有数据，使用默认风险因子
        setCountryRiskFactor(1.0);
      }
    }
  }, [country]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAmount(value);
    calculatePremium(value, duration, selectedProduct);
  };

  const handleDurationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number;
    setDuration(value);
    calculatePremium(amount, value, selectedProduct);
  };

  // 计算保费
  const calculatePremium = (insuredAmount: string, durationInDays: number, product: InsuranceProduct) => {
    // 简单的保费计算公式：金额 * 天数 * 费率系数 * 国家风险因子
    const amount = parseFloat(insuredAmount) || 0;
    const baseRate = product.id === 'btc_hashrate' ? 0.0001 : 0.00015; // 每天基础费率
    const volatilityFactor = product.id === 'btc_hashrate' ? 1.2 : 1.5; // 波动因子
    
    // 保费 = 金额 * 天数 * 基础费率 * 波动因子 * 国家风险因子
    const calculatedPremium = amount * durationInDays * baseRate * volatilityFactor * countryRiskFactor;
    
    setPremium(calculatedPremium.toFixed(2));
  };

  // 购买保险
  const handleBuyInsurance = async () => {
    console.log('当前钱包状态:', { 
      currentAccount, 
      selectedProduct,
      amount,
      duration,
      premium,
      country
    });

    if (!currentAccount) {
      setError('请先连接钱包');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const insuredAmount = Math.floor(parseFloat(amount) * Math.pow(10, token.decimals || 6));
      const premiumAmount = Math.floor(parseFloat(premium) * Math.pow(10, token.decimals || 6));

      // 构建创建保单交易
      const transaction = {
        kind: "moveCall",
        data: {
          packageObjectId: INSURANCE_CONTRACT.PACKAGE_ID,
          module: INSURANCE_CONTRACT.INSURANCE.MODULE,
          function: INSURANCE_CONTRACT.INSURANCE.FUNCTIONS.CREATE_POLICY,
          typeArguments: [token.coinType || ''],
          arguments: [
            INSURANCE_CONTRACT.POLICY_MANAGER_ID, // PolicyManager对象ID
            insuredAmount.toString(),
            duration.toString(),
            premiumAmount.toString(),
            "0x6", // Clock对象ID
            country || "全球" // 添加国家参数
          ],
        }
      };

      console.log('交易数据:', transaction);

      const result = await signAndExecuteTransaction({
        transaction: transaction as any,
      });

      console.log('交易结果:', result);
      setSuccess(`成功购买保险！交易已提交`);
      setLoading(false);
    } catch (err: any) {
      console.error('交易错误:', err);
      setError(err.message || '交易失败');
      setLoading(false);
    }
  };

  // 查看保单
  const handleViewPolicy = () => {
    // 实现查看保单的功能
    console.log('查看保单');
  };

  // 保险理赔
  const handleClaimInsurance = () => {
    // 实现保险理赔的功能
    console.log('申请理赔');
  };

  return (
    <StyledCard>
      {/* 显示保险描述 */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(194, 224, 255, 0.08)' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          保障BTC算力波动下跌时的收益损失
        </Typography>
      </Box>
      
      {/* 保险参数设置 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="保障金额"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: <Typography>sBTC</Typography>
          }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>保障期限</InputLabel>
          <Select
            value={duration}
            label="保障期限"
            onChange={handleDurationChange as any}
          >
            {[7, 14, 30, 60, 90].filter(days => 
              days >= selectedProduct.minDuration && 
              days <= selectedProduct.maxDuration
            ).map(days => (
              <MenuItem key={days} value={days}>{days} 天</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* 显示计算的保费 */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="body2">预估保费:</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" fontWeight="bold">
                {premium} sBTC
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      {/* 操作按钮 */}
      {currentAccount ? (
        <Box>
          <StyledButton 
            variant="contained" 
            color="primary"
            onClick={handleBuyInsurance}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '购买保险'}
          </StyledButton>
          
          {!compact && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={handleViewPolicy}
                >
                  查看我的保单
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                  onClick={handleClaimInsurance}
                >
                  申请理赔
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            请连接钱包以购买保险
          </Typography>
          <ConnectButton />
        </Box>
      )}
      
      {/* 错误和成功提示 */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </StyledCard>
  );
};

export default InsuranceInterface; 