'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import BetHistory from './BetHistory';
import BotControl from './dashboard/BotControl';
import UserInformation from './dashboard/UserInformation';
import Configuration from './dashboard/Configuration';
import StrategyManagement from './dashboard/StrategyManagement';
import ManualBet from './dashboard/ManualBet';
import LiveStats from './dashboard/LiveStats';

// Import types
import { BettingConfig } from '../app/lib/wolfbet';
import { StrategyConfig } from '../app/lib/strategies';
import { BotStats } from './dashboard/LiveStats';
import { ManualBetConfig } from './dashboard/ManualBet';
import { UserData } from './dashboard/UserInformation';

// Import actions
import { placeManualBet, saveStrategy, deleteStrategy, getStrategies } from '../app/actions';

interface DashboardContentProps {
  initialAccessToken: string;
  siteName: string;
}

export default function DashboardContent({ initialAccessToken, siteName }: DashboardContentProps) {
  const { t } = useTranslation();
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [status, setStatus] = useState('Idle');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [config, setConfig] = useState<BettingConfig>({
    baseBet: 0.00000001,
    payoutMultiplier: 2,
    stopOnWin: 0,
    stopOnLoss: 0,
    increaseOnWin: { type: 'none', value: 0, resetBaseBet: false },
    increaseOnLoss: { type: 'none', value: 0, resetBaseBet: false },
    betRule: 'over',
    betChance: 50,
    clientSeed: '',
    serverSeed: '',
  });
  const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDescription, setNewStrategyDescription] = useState('');
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [manualBetConfig, setManualBetConfig] = useState<ManualBetConfig>({
    amount: 0.00000001,
    betRule: 'over',
    betChance: 50,
  });
  const [loadingManualBet, setLoadingManualBet] = useState(false);
  const [stats, setStats] = useState<BotStats>({
    wins: 0,
    losses: 0,
    currentProfit: 0,
    totalBets: 0,
    winStreak: 0,
    lossStreak: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    initialBalance: 0,
    currentBalance: 0,
    profitPercentage: 0,
    currentBetAmount: 0,
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [key, subKey] = name.split('.');
      setConfig((prev) => ({
        ...prev,
        [key]: {
          // @ts-expect-error - key is a dynamic property from the input name
          ...prev[key],
          [subKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleManualBetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManualBetConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStart = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch('/api/wolfbet/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, siteName, config }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t('bot_started'));
        setStatus('Running');
      } else {
        toast.error(data.message || t('failed_to_start_bot'));
      }
    } catch (_) {
      toast.error(t('failed_to_start_bot'));
    }
    setLoadingStatus(false);
  };

  const handleStop = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch('/api/wolfbet/stop', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        toast.success(t('bot_stopped'));
        setStatus('Idle');
      } else {
        toast.error(data.message || t('failed_to_stop_bot'));
      }
    } catch (_) {
      toast.error(t('failed_to_stop_bot'));
    }
    setLoadingStatus(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!accessToken) return;
      setLoadingUserData(true);
      try {
        const response = await fetch(`/api/wolfbet/user?accessToken=${accessToken}&siteName=${siteName}`);
        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
        } else {
          toast.error(data.message || t('failed_to_fetch_user_data'));
        }
      } catch (_) {
        toast.error(t('failed_to_fetch_user_data'));
      }
      setLoadingUserData(false);
    };

    const fetchStatus = async () => {
      setLoadingStatus(true);
      try {
        const response = await fetch('/api/wolfbet/status');
        const data = await response.json();
        setStatus(data.status || 'Idle');
        setStats(data.stats || { wins: 0, losses: 0, profit: 0, wagered: 0, streak: '' });
      } catch (_) {
        // Do not show error toast for status fetch, as it runs in the background
      }
      setLoadingStatus(false);
    };

    fetchUserData();
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [accessToken, siteName, t]);

  const handleSaveStrategy = useCallback(async () => {
    if (!newStrategyName) {
      toast.error(t('strategy_name_required'));
      return;
    }
    const strategy: StrategyConfig = {
      name: newStrategyName,
      description: newStrategyDescription,
      ...config,
    };
    setLoadingStrategies(true);
    const result = await saveStrategy(strategy);
    if (result.success) {
      toast.success(t('strategy_saved'));
      setStrategies((prev) => [...prev, strategy]);
      setNewStrategyName('');
      setNewStrategyDescription('');
    } else {
      toast.error(result.message || t('failed_to_save_strategy'));
    }
    setLoadingStrategies(false);
  }, [newStrategyName, newStrategyDescription, config, t]);

  const handleLoadStrategy = useCallback(async () => {
    if (!selectedStrategy) return;
    const strategy = strategies.find((s) => s.name === selectedStrategy);
    if (strategy) {
      setConfig(strategy);
      toast.success(t('strategy_loaded'));
    }
  }, [selectedStrategy, strategies, t]);

  const handleDeleteStrategy = useCallback(async () => {
    if (!selectedStrategy) return;
    setLoadingStrategies(true);
    const result = await deleteStrategy(selectedStrategy);
    if (result.success) {
      toast.success(t('strategy_deleted'));
      setStrategies((prev) => prev.filter((s) => s.name !== selectedStrategy));
      setSelectedStrategy('');
    } else {
      toast.error(result.message || t('failed_to_delete_strategy'));
    }
    setLoadingStrategies(false);
  }, [selectedStrategy, t]);

  const handleManualBet = useCallback(async () => {
    setLoadingManualBet(true);
    const result = await placeManualBet(
      siteName,
      accessToken,
      manualBetConfig.amount,
      manualBetConfig.betRule,
      manualBetConfig.betChance
    );
    if (result.success) {
      toast.success(result.message || (result.win ? t('bet_won') : t('bet_lost')));
      // Update stats or history if needed
    } else {
      toast.error(result.message || t('failed_to_place_bet'));
    }
    setLoadingManualBet(false);
  }, [accessToken, siteName, manualBetConfig, t]);

  useEffect(() => {
    const fetchStrategies = async () => {
      setLoadingStrategies(true);
      const result = await getStrategies();
      if (result.success && result.strategies) {
        setStrategies(result.strategies);
      } else {
        toast.error(result.message || t('failed_to_load_strategies'));
      }
      setLoadingStrategies(false);
    };
    fetchStrategies();
  }, [t]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('welcome')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <BotControl
            status={status}
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            handleStart={handleStart}
            handleStop={handleStop}
            loadingStatus={loadingStatus}
          />

          <UserInformation userData={userData} loadingUserData={loadingUserData} />

          <Configuration config={config} handleConfigChange={handleConfigChange} loadingStrategies={loadingStrategies} />
          <StrategyManagement
            strategies={strategies}
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={setSelectedStrategy}
            newStrategyName={newStrategyName}
            setNewStrategyName={setNewStrategyName}
            newStrategyDescription={newStrategyDescription}
            setNewStrategyDescription={setNewStrategyDescription}
            handleSaveStrategy={handleSaveStrategy}
            handleLoadStrategy={handleLoadStrategy}
            handleDeleteStrategy={handleDeleteStrategy}
            loadingStrategies={loadingStrategies}
          />
          <ManualBet
            manualBetConfig={manualBetConfig}
            handleManualBetChange={handleManualBetChange}
            handleManualBet={handleManualBet}
            loadingManualBet={loadingManualBet}
          />
          
          <LiveStats stats={stats} loadingStatus={loadingStatus} />
        </div>
      </div>
      <BetHistory />
    </main>
  );
}