import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Select,
  MenuItem,
  Button,
  styled,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TimePeriod,
  LockPeriod,
  generatePriceData,
  calculateAPY,
  calculateExpectedReturn,
  calculateTotalAtMaturity,
} from '../../utils/bondPoolHelpers';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
}));

const TimeButton = styled(ToggleButton)(({ theme }) => ({
  padding: '4px 16px',
  borderRadius: theme.spacing(1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const BondPool: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1d');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1000');
  const [lockPeriod, setLockPeriod] = useState<LockPeriod>('3');
  const [priceData, setPriceData] = useState(generatePriceData('1d'));

  // 更新价格数据
  useEffect(() => {
    setPriceData(generatePriceData(timePeriod));
  }, [timePeriod]);

  const handleTimePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: TimePeriod | null) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };

  const handleActionChange = (newAction: 'buy' | 'sell') => {
    setAction(newAction);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const apy = calculateAPY(lockPeriod);
  const expectedReturn = calculateExpectedReturn(parsedAmount, lockPeriod);
  const totalAtMaturity = calculateTotalAtMaturity(parsedAmount, lockPeriod);

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Pricing</Typography>
        <ToggleButtonGroup
          value={timePeriod}
          exclusive
          onChange={handleTimePeriodChange}
          size="small"
        >
          <TimeButton value="1d">1d</TimeButton>
          <TimeButton value="1w">1w</TimeButton>
          <TimeButton value="1m">1m</TimeButton>
          <TimeButton value="6m">6m</TimeButton>
        </ToggleButtonGroup>
      </Box>

      <StyledCard>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Price Chart */}
          <Box sx={{ flex: 1, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="time"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis
                  domain={[935, 1110]}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#1E88E5"
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Operation Panel */}
          <Box sx={{ width: 320 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                fullWidth
                onClick={() => handleActionChange('buy')}
                variant={action === 'buy' ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: action === 'buy' ? '#4CAF50' : 'transparent',
                  borderColor: action === 'buy' ? 'transparent' : 'divider',
                  color: action === 'buy' ? '#fff' : 'text.primary',
                  '&:hover': {
                    backgroundColor: action === 'buy' ? '#43A047' : 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Buy
              </Button>
              <Button
                fullWidth
                onClick={() => handleActionChange('sell')}
                variant={action === 'sell' ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: action === 'sell' ? '#4CAF50' : 'transparent',
                  borderColor: action === 'sell' ? 'transparent' : 'divider',
                  color: action === 'sell' ? '#fff' : 'text.primary',
                  '&:hover': {
                    backgroundColor: action === 'sell' ? '#43A047' : 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Sell
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amount (USDT)
              </Typography>
              <TextField
                fullWidth
                value={amount}
                onChange={handleAmountChange}
                variant="outlined"
                size="small"
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*',
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Lock Period
              </Typography>
              <Select
                fullWidth
                value={lockPeriod}
                onChange={(e) => setLockPeriod(e.target.value as LockPeriod)}
                size="small"
              >
                <MenuItem value="1">1 Month</MenuItem>
                <MenuItem value="3">3 Months</MenuItem>
                <MenuItem value="6">6 Months</MenuItem>
                <MenuItem value="12">12 Months</MenuItem>
              </Select>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Expected Return
                </Typography>
                <Typography variant="body1">
                  ${expectedReturn.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  APY
                </Typography>
                <Typography variant="body1">
                  {apy.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Total at Maturity
                </Typography>
                <Typography variant="body1">
                  ${totalAtMaturity.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#1E88E5',
                '&:hover': {
                  backgroundColor: '#1976D2',
                },
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default BondPool; 