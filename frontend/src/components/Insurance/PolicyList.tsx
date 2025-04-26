import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip, 
  CircularProgress, 
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit';
import { INSURANCE_CONTRACT } from '../../config/contracts';

// 样式化组件
const PolicyCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  },
}));

// 定义保单类型
interface Policy {
  id: string;
  productId: string;
  name: string;
  insuredAmount: number;
  premium: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'claimed';
  coveragePercentage: number;
}

// 模拟保单数据
const MOCK_POLICIES: Policy[] = [
  {
    id: '0x123456789abcdef',
    productId: 'btc_price',
    name: 'BTC价格波动保险',
    insuredAmount: 1000,
    premium: 3.6,
    startDate: new Date(2024, 3, 1),
    endDate: new Date(2024, 3, 30),
    status: 'active',
    coveragePercentage: 0.8
  },
  {
    id: '0x987654321fedcba',
    productId: 'sui_price',
    name: 'SUI价格波动保险',
    insuredAmount: 500,
    premium: 2.25,
    startDate: new Date(2024, 2, 15),
    endDate: new Date(2024, 4, 15),
    status: 'active',
    coveragePercentage: 0.7
  },
  {
    id: '0xabcdef123456789',
    productId: 'btc_price',
    name: 'BTC价格波动保险',
    insuredAmount: 2000,
    premium: 7.2,
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 2, 1),
    status: 'expired',
    coveragePercentage: 0.8
  }
];

// 格式化日期函数
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

// 保单状态标签颜色映射
const statusColorMap = {
  active: 'success',
  expired: 'default',
  claimed: 'primary'
};

const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  
  // Sui DApp Kit hooks
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // 加载保单数据
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        
        // 如果用户已连接钱包，则从链上获取保单
        if (currentAccount) {
          // 暂时使用模拟数据，实际应从链上获取数据
          // 这里需要实现与合约交互的逻辑
          setTimeout(() => {
            setPolicies(MOCK_POLICIES);
            setLoading(false);
          }, 1000);
        } else {
          setPolicies([]);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('获取保单失败:', err);
        setError('获取保单失败: ' + (err.message || '未知错误'));
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [currentAccount, suiClient]);

  // 处理申请理赔
  const handleOpenClaimDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    setOpenClaimDialog(true);
  };

  const handleCloseClaimDialog = () => {
    setOpenClaimDialog(false);
    setSelectedPolicy(null);
    setClaimAmount('');
    setClaimReason('');
  };

  const handleSubmitClaim = async () => {
    if (!selectedPolicy || !currentAccount) return;
    
    try {
      setClaimLoading(true);
      
      // 计算理赔金额（微单位）
      const amount = Math.floor(parseFloat(claimAmount) * 1000000);
      
      // 构建理赔交易
      const transaction = {
        kind: "moveCall",
        data: {
          packageObjectId: INSURANCE_CONTRACT.PACKAGE_ID,
          module: INSURANCE_CONTRACT.INSURANCE.MODULE,
          function: INSURANCE_CONTRACT.INSURANCE.FUNCTIONS.CLAIM,
          typeArguments: [],
          arguments: [
            INSURANCE_CONTRACT.POLICY_MANAGER_ID, // PolicyManager对象ID
            selectedPolicy.id, // 保单ID
            claimReason, // proof参数，这里使用理赔原因
          ],
        }
      };

      console.log('理赔交易数据:', transaction);

      const result = await signAndExecuteTransaction({
        transaction: transaction as any,
      });

      console.log('理赔交易结果:', result);
      
      // 更新本地保单状态
      setPolicies(prev => 
        prev.map(p => 
          p.id === selectedPolicy.id 
            ? { ...p, status: 'claimed' as const } 
            : p
        )
      );
      
      handleCloseClaimDialog();
      setClaimLoading(false);
    } catch (err: any) {
      console.error('理赔申请失败:', err);
      setError('理赔申请失败: ' + (err.message || '未知错误'));
      setClaimLoading(false);
    }
  };

  // 处理赎回保单
  const handleRedeem = async (policy: Policy) => {
    if (!currentAccount) return;
    
    try {
      setLoading(true);
      
      // 构建赎回交易
      const transaction = {
        kind: "moveCall",
        data: {
          packageObjectId: INSURANCE_CONTRACT.PACKAGE_ID,
          module: INSURANCE_CONTRACT.INSURANCE.MODULE,
          function: INSURANCE_CONTRACT.INSURANCE.FUNCTIONS.REDEEM,
          typeArguments: [],
          arguments: [
            INSURANCE_CONTRACT.POLICY_MANAGER_ID, // PolicyManager对象ID
            policy.id // 保单ID
          ],
        }
      };

      console.log('赎回交易数据:', transaction);

      const result = await signAndExecuteTransaction({
        transaction: transaction as any,
      });

      console.log('赎回交易结果:', result);
      
      // 更新本地保单状态
      setPolicies(prev => prev.filter(p => p.id !== policy.id));
      
      setLoading(false);
    } catch (err: any) {
      console.error('保单赎回失败:', err);
      setError('保单赎回失败: ' + (err.message || '未知错误'));
      setLoading(false);
    }
  };

  // 计算保单剩余天数
  const getRemainingDays = (endDate: Date): number => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!currentAccount) {
    return (
      <Box>
        <Typography variant="body1" textAlign="center" my={4}>
          请先连接钱包以查看您的保单
        </Typography>
      </Box>
    );
  }

  if (policies.length === 0) {
    return (
      <Box>
        <Typography variant="body1" textAlign="center" my={4}>
          您还没有购买任何保险保单
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        我的保单 ({policies.length})
      </Typography>
      
      {policies.map(policy => (
        <PolicyCard key={policy.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {policy.name}
                </Typography>
                <Chip 
                  label={policy.status === 'active' ? '有效' : policy.status === 'expired' ? '已过期' : '已理赔'} 
                  color={statusColorMap[policy.status] as any}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  保单ID
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {policy.id.substring(0, 10)}...
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  保障金额
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {policy.insuredAmount} sBTC
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  保障期限
                </Typography>
                <Typography variant="body2">
                  {formatDate(policy.startDate)} 至 {formatDate(policy.endDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  保费
                </Typography>
                <Typography variant="body2">
                  {policy.premium} sBTC
                </Typography>
              </Grid>
              
              {policy.status === 'active' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    剩余天数
                  </Typography>
                  <Typography variant="body2" color={getRemainingDays(policy.endDate) < 7 ? 'error.main' : 'inherit'}>
                    {getRemainingDays(policy.endDate)} 天
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  保障范围
                </Typography>
                <Typography variant="body2">
                  {policy.coveragePercentage * 100}% 价格波动损失
                </Typography>
              </Grid>
              
              {policy.status === 'active' && (
                <Grid item xs={12} mt={1} display="flex" justifyContent="flex-end" gap={1}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleRedeem(policy)}
                  >
                    赎回保单
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    color="primary"
                    onClick={() => handleOpenClaimDialog(policy)}
                  >
                    申请理赔
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </PolicyCard>
      ))}
      
      {/* 理赔申请对话框 */}
      <Dialog open={openClaimDialog} onClose={handleCloseClaimDialog} maxWidth="sm" fullWidth>
        <DialogTitle>申请保险理赔</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  保单信息:
                </Typography>
                <Typography variant="body2">
                  保险类型: {selectedPolicy.name}
                </Typography>
                <Typography variant="body2">
                  保障金额: {selectedPolicy.insuredAmount} sBTC
                </Typography>
                <Typography variant="body2">
                  最高赔付: {(selectedPolicy.insuredAmount * selectedPolicy.coveragePercentage).toFixed(2)} sBTC
                </Typography>
              </Box>
              
              <TextField
                label="申请理赔金额"
                type="number"
                fullWidth
                variant="outlined"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: <Typography variant="body2">sBTC</Typography>
                }}
                helperText={`最高可申请 ${(selectedPolicy.insuredAmount * selectedPolicy.coveragePercentage).toFixed(2)} sBTC`}
              />
              
              <TextField
                label="理赔原因"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                margin="normal"
                placeholder="请详细描述损失原因和情况..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog} disabled={claimLoading}>
            取消
          </Button>
          <Button 
            onClick={handleSubmitClaim} 
            variant="contained" 
            color="primary"
            disabled={claimLoading || !claimAmount || !claimReason}
          >
            {claimLoading ? <CircularProgress size={24} /> : '提交理赔申请'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PolicyList; 