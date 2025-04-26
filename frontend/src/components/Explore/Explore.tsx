import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Region, ExploreState } from './types';
import { RegionList } from './RegionList';
import { countryRegions } from './countryData';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

const Explore: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [state, setState] = useState<ExploreState>({
    selectedTimePeriod: 'all', // 默认为全部
    searchQuery: '',
    regions: countryRegions,
    loading: false,
    error: null,
    sortBy: 'totalOI',
    sortDirection: 'desc',
  });

  const handleSort = (field: keyof Region) => {
    setState(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedRegions = React.useMemo(() => {
    return state.regions
      .sort((a, b) => {
        const aValue = a[state.sortBy];
        const bValue = b[state.sortBy];
        const modifier = state.sortDirection === 'asc' ? 1 : -1;
        return (aValue < bValue ? -1 : 1) * modifier;
      });
  }, [state.regions, state.sortBy, state.sortDirection]);

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      {/* 顶部标题区 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h6">
          比特币挖矿哈希率分布
        </Typography>
      </Box>

      {/* 地区列表 */}
      <RegionList
        regions={filteredAndSortedRegions}
        sortBy={state.sortBy}
        sortDirection={state.sortDirection}
        onSort={handleSort}
        currentAccount={currentAccount}
        signAndExecuteTransaction={signAndExecuteTransaction}
        suiClient={suiClient}
      />
    </Box>
  );
};

export default Explore; 