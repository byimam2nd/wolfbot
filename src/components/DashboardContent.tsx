'use client';

import { useState, useEffect, useCallback } from 'react';
import { BettingConfig } from '../app/lib/wolfbet';
import { placeManualBet, saveStrategy, deleteStrategy, withdraw, loadStrategies } from '../app/actions';
import { StrategyConfig } from '../app/lib/strategies';
import { useTranslation } from 'react-i18next';
import { strategyManager } from '../app/lib/strategies/strategyManager';
import BetHistory from './BetHistory';

interface UserData {
  username: string;
  balance: number;
  currency: string;
}

interface DashboardContentProps {
  initialAccessToken: string;
  siteName: string; // Add siteName prop
}

export default function DashboardContent({ initialAccessToken, siteName }: DashboardContentProps) {
  const { t } = useTranslation();
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [status, setStatus] = useState('Idle');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    currentBetAmount: 0,
    currentProfit: 0,
    totalBets: 0,
    wins: 0,
    losses: 0,
    winStreak: 0,
    lossStreak: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    initialBalance: 0,
    currentBalance: 0,
    profitPercentage: 0,
  });
  const [config, setConfig] = useState<BettingConfig>({
    baseBet: 0.00000001,
    payoutMultiplier: 2,
    stopOnWin: 0,
    stopOnLoss: 0,
    increaseOnWin: {
      type: 'none',
      value: 0,
      resetBaseBet: false,
    },
    increaseOnLoss: {
      type: 'none',
      value: 0,
      resetBaseBet: false,
    },
    betRule: 'over',
    betChance: 49.5,
    clientSeed: '',
    serverSeed: '',
  });

  const [manualBetConfig, setManualBetConfig] = useState({
    amount: 0.00000001,
    betRule: 'over' as 'over' | 'under',
    betChance: 49.5,
  });
  const [manualBetResult, setManualBetResult] = useState<{ success: boolean; message?: string; win?: boolean; profit?: number; } | null>(null);

  // Strategy management states
  const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDescription, setNewStrategyDescription] = useState('');
  const [strategyMessage, setStrategyMessage] = useState('');

  // Withdrawal states
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [withdrawalCurrency, setWithdrawalCurrency] = useState('USDT'); // Default currency
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/wolfbet/status');
      const data = await response.json();
      setStatus(data.status);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (_: unknown) {
      console.error('Error fetching status:', _);
    }
  };

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/wolfbet/user?accessToken=${token}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        const data = await response.json();
        setError(t(data.error || 'failed_to_fetch_user_data'));
        setUserData(null);
      }
    } catch (_: unknown) {
      setError(t('an_unexpected_error_occurred_while_fetching_user_data'));
      setUserData(null);
    }
  }, [t]);

  const fetchStrategies = async () => {
    const result = await loadStrategies();
    if (result.success && result.strategies) {
      strategyManager.setCustomStrategies(result.strategies);
      setStrategies(strategyManager.getAllStrategies());
      if (strategyManager.getAllStrategies().length > 0) {
        setSelectedStrategy(strategyManager.getAllStrategies()[0].name);
      }
    } else {
      console.error('Failed to load strategies:', result.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'Running') {
        fetchStatus();
      }
    }, 1000); // Fetch status more frequently
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('wolfbetAccessToken', accessToken);
      fetchUserData(accessToken);
    } else {
      localStorage.removeItem('wolfbetAccessToken');
      setUserData(null);
    }
    fetchStrategies(); // Fetch strategies on component mount
  }, [accessToken, fetchUserData]);

  const handleStart = async () => {
    if (!accessToken) {
      setError(t('access_token_required'));
      return;
    }
    setError('');
    setStatus(t('starting'));
    try {
      const response = await fetch('/api/wolfbet/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, apiKey: accessToken, config }), // Pass siteName and config
      });
      if (response.ok) {
        setStatus(t('running'));
        fetchStatus();
      } else {
        const data = await response.json();
        setError(t(data.error || 'failed_to_start_bot'));
        setStatus(t('idle'));
      }
    } catch (_: unknown) {
      setError(t('an_unexpected_error_occurred'));
      setStatus(t('idle'));
    }
  };

  const handleStop = async () => {
    setStatus(t('stopping'));
    try {
      const response = await fetch('/api/wolfbet/stop', {
        method: 'POST',
      });
      if (response.ok) {
        setStatus(t('idle'));
      } else {
        setError(t('failed_to_stop_bot'));
        setStatus(t('running')); // Revert status if stop fails
      }
    } catch (_: unknown) {
      setError(t('an_unexpected_error_occurred'));
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // Safely access checked

    if (name.startsWith('increaseOnWin.')) {
      const prop = name.split('.')[1];
      setConfig(prev => ({
        ...prev,
        increaseOnWin: {
          ...prev.increaseOnWin,
          [prop]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
        },
      }));
    } else if (name.startsWith('increaseOnLoss.')) {
      const prop = name.split('.')[1];
      setConfig(prev => ({
        ...prev,
        increaseOnLoss: {
          ...prev.increaseOnLoss,
          [prop]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
        },
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
      }));
    }
  };

  const handleManualBetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setManualBetConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleManualBet = async () => {
    if (!accessToken) {
      setManualBetResult({ success: false, message: t('access_token_required_for_manual_bet') });
      return;
    }
    setManualBetResult(null);
    const result = await placeManualBet(
      siteName,
      accessToken,
      manualBetConfig.amount,
      manualBetConfig.betRule,
      manualBetConfig.betChance
    );
    setManualBetResult(result);
    fetchUserData(accessToken); // Refresh balance after manual bet
  };

  const handleSaveStrategy = async () => {
    if (!newStrategyName) {
      setStrategyMessage(t('strategy_name_cannot_be_empty'));
      return;
    }
    const strategyToSave: StrategyConfig = {
      ...config,
      name: newStrategyName,
      description: newStrategyDescription,
    };
    const result = await saveStrategy(strategyToSave);
    if (result.success) {
      setStrategyMessage(t(result.message || 'strategy_saved'));
      setNewStrategyName('');
      setNewStrategyDescription('');
      fetchStrategies(); // Refresh the list of strategies
    } else {
      setStrategyMessage(t(result.message || 'failed_to_save_strategy'));
    }
  };

  const handleLoadStrategy = () => {
    const strategyToLoad = strategyManager.getStrategy(selectedStrategy);
    if (strategyToLoad) {
      // Exclude name and description when setting config
      const { name, description, ...bettingConfig } = strategyToLoad;
      setConfig(bettingConfig);
      setStrategyMessage(t('strategy_loaded', { name }));
    } else {
      setStrategyMessage(t('strategy_not_found'));
    }
  };

  const handleDeleteStrategy = async () => {
    if (!selectedStrategy) {
      setStrategyMessage(t('no_strategy_selected_to_delete'));
      return;
    }
    const result = await deleteStrategy(selectedStrategy);
    if (result.success) {
      setStrategyMessage(t(result.message || 'strategy_deleted'));
      setSelectedStrategy('');
      fetchStrategies(); // Refresh the list of strategies
    } else {
      setStrategyMessage(t(result.message || 'failed_to_delete_strategy'));
    }
  };

  const handleWithdraw = async () => {
    if (!accessToken) {
      setWithdrawalMessage(t('access_token_required_for_withdrawal'));
      return;
    }
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      setWithdrawalMessage(t('withdrawal_amount_invalid'));
      return;
    }
    if (!withdrawalCurrency) {
      setWithdrawalMessage(t('withdrawal_currency_required'));
      return;
    }
    if (!withdrawalAddress) {
      setWithdrawalMessage(t('withdrawal_address_required'));
      return;
    }

    setWithdrawalMessage('');
    const result = await withdraw(
      siteName,
      accessToken,
      withdrawalAmount,
      withdrawalCurrency,
      withdrawalAddress
    );

    if (result.success) {
      setWithdrawalMessage(t('withdrawal_successful', { amount: withdrawalAmount, currency: withdrawalCurrency, address: withdrawalAddress, transactionId: result.transactionId }));
      setWithdrawalAmount(0);
      setWithdrawalAddress('');
      fetchUserData(accessToken); // Refresh balance after withdrawal
    } else {
      setWithdrawalMessage(t(result.message || 'withdrawal_failed'));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('welcome')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('bot_control')}</h2>
            <div className="flex items-center mb-4">
              <p className="mr-4">{t('status')}:</p>
              <p className={`font-bold text-lg ${status === t('running') ? 'text-green-500' : 'text-yellow-500'}`}>
                {status}
              </p>
            </div>
            <div className="flex gap-4 mb-4">
              <button onClick={handleStart} disabled={status === t('running')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
                {t('start')}
              </button>
              <button onClick={handleStop} disabled={status !== t('running')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
                {t('stop')}
              </button>
            </div>
            <div className="flex flex-col">
              <label htmlFor="accessToken" className="mb-2 font-semibold">{t('access_token')}</label>
              <input id="accessToken" type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-2 text-white" placeholder={t('enter_access_token')} />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>

          {userData && (
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">{t('user_information')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">{t('username')}</p>
                  <p className="text-xl font-bold">{userData.username}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('balance')}</p>
                  <p className="text-xl font-bold">{userData.balance?.toFixed(8)} {userData.currency}</p>
                </div>
              </div>
            </div>
          )}

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('configuration')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm">{t('base_bet')}</label>
                <input type="number" name="baseBet" value={config.baseBet} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('payout_multiplier')}</label>
                <input type="number" name="payoutMultiplier" value={config.payoutMultiplier} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('stop_on_win_profit')}</label>
                <input type="number" name="stopOnWin" value={config.stopOnWin} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('stop_on_loss')}</label>
                <input type="number" name="stopOnLoss" value={config.stopOnLoss} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('stop_on_win_percentage')}</label>
                <input type="number" name="stopOnWinPercentage" value={config.stopOnWinPercentage || 0} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('stop_on_loss_percentage')}</label>
                <input type="number" name="stopOnLossPercentage" value={config.stopOnLossPercentage || 0} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('bet_rule')}</label>
                <select name="betRule" value={config.betRule} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2">
                  <option value="over">{t('over')}</option>
                  <option value="under">{t('under')}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('bet_chance')}</label>
                <input type="number" name="betChance" value={config.betChance} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('client_seed')}</label>
                <input type="text" name="clientSeed" value={config.clientSeed} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('server_seed')}</label>
                <input type="text" name="serverSeed" value={config.serverSeed} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>

              {/* Increase on Win */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mt-4 mb-2">{t('increase_on_win')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">{t('type')}</label>
                    <select name="increaseOnWin.type" value={config.increaseOnWin.type} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2">
                      <option value="none">{t('none')}</option>
                      <option value="percentage">{t('percentage')}</option>
                      <option value="fixed">{t('fixed')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t('value')}</label>
                    <input type="number" name="increaseOnWin.value" value={config.increaseOnWin.value} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" disabled={config.increaseOnWin.type === 'none'} />
                  </div>
                  <div className="flex items-center col-span-2">
                    <input type="checkbox" id="increaseOnWin.resetBaseBet" name="increaseOnWin.resetBaseBet" checked={config.increaseOnWin.resetBaseBet} onChange={handleConfigChange} className="mr-2" />
                    <label htmlFor="increaseOnWin.resetBaseBet">{t('reset_base_bet_on_win')}</label>
                  </div>
                </div>
              </div>

              {/* Increase on Loss */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mt-4 mb-2">{t('increase_on_loss')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">{t('type')}</label>
                    <select name="increaseOnLoss.type" value={config.increaseOnLoss.type} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2">
                      <option value="none">{t('none')}</option>
                      <option value="percentage">{t('percentage')}</option>
                      <option value="fixed">{t('fixed')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t('value')}</label>
                    <input type="number" name="increaseOnLoss.value" value={config.increaseOnLoss.value} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" disabled={config.increaseOnLoss.type === 'none'} />
                  </div>
                  <div className="flex items-center col-span-2">
                    <input type="checkbox" id="increaseOnLoss.resetBaseBet" name="increaseOnLoss.resetBaseBet" checked={config.increaseOnLoss.resetBaseBet} onChange={handleConfigChange} className="mr-2" />
                    <label htmlFor="increaseOnLoss.resetBaseBet">{t('reset_base_bet_on_loss')}</label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('strategy_management')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">{t('strategy_name')}</label>
                <input type="text" value={newStrategyName} onChange={(e) => setNewStrategyName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2" placeholder={t('enter_strategy_name')} />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('description')}</label>
                <input type="text" value={newStrategyDescription} onChange={(e) => setNewStrategyDescription(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2" placeholder={t('optional_description')} />
              </div>
            </div>
            <button onClick={handleSaveStrategy} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {t('save_current_config_as_strategy')}
            </button>

            <div className="mt-6">
              <label className="block mb-1 text-sm">{t('load_existing_strategy')}</label>
              <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2">
                <option value="">{t('select_a_strategy')}</option>
                {strategies.map(s => (
                  <option key={s.name} value={s.name}>{s.name} ({s.description})</option>
                ))}
              </select>
              <div className="flex gap-4 mt-4">
                <button onClick={handleLoadStrategy} disabled={!selectedStrategy} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
                  {t('load_strategy')}
                </button>
                <button onClick={handleDeleteStrategy} disabled={!selectedStrategy} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
                  {t('delete_strategy')}
                </button>
              </div>
            </div>
            {strategyMessage && <p className="text-center text-sm mt-4 text-yellow-400">{strategyMessage}</p>}
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('manual_bet')}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm">{t('amount')}</label>
                <input type="number" name="amount" value={manualBetConfig.amount} onChange={handleManualBetChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('bet_rule')}</label>
                <select name="betRule" value={manualBetConfig.betRule} onChange={handleManualBetChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2">
                  <option value="over">{t('over')}</option>
                  <option value="under">{t('under')}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('bet_chance')}</label>
                <input type="number" name="betChance" value={manualBetConfig.betChance} onChange={handleManualBetChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
            </div>
            <button onClick={handleManualBet} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
              {t('place_manual_bet')}
            </button>
            {manualBetResult && (
              <div className={`mt-4 p-3 rounded ${manualBetResult.success ? (manualBetResult.win ? 'bg-green-800' : 'bg-red-800') : 'bg-red-800'}`}>
                <p className="font-bold">{t('result')}: {manualBetResult.message}</p>
                {manualBetResult.success && manualBetResult.profit !== undefined && (
                  <p>{t('profit_display', { profit: manualBetResult.profit.toFixed(8) })}</p>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('withdrawal')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">{t('withdrawal_amount')}</label>
                <input type="number" name="withdrawalAmount" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded p-2" step="any" />
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('withdrawal_currency')}</label>
                <input type="text" name="withdrawalCurrency" value={withdrawalCurrency} onChange={(e) => setWithdrawalCurrency(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div className="col-span-2">
                <label className="block mb-1 text-sm">{t('withdrawal_address')}</label>
                <input type="text" name="withdrawalAddress" value={withdrawalAddress} onChange={(e) => setWithdrawalAddress(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
            </div>
            <button onClick={handleWithdraw} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {t('initiate_withdrawal')}
            </button>
            {withdrawalMessage && (
              <div className={`mt-4 p-3 rounded ${withdrawalMessage.includes(t('successful')) ? 'bg-green-800' : 'bg-red-800'}`}>
                <p className="font-bold">{withdrawalMessage}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('live_stats')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-400">{t('total_profit')}</p>
                <p className={`text-2xl font-bold ${stats.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.currentProfit.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('total_bets')}</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalBets}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('wins')}</p>
                <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('losses')}</p>
                <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('win_streak')}</p>
                <p className="text-2xl font-bold">{stats.winStreak}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('loss_streak')}</p>
                <p className="text-2xl font-bold">{stats.lossStreak}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('max_win_streak')}</p>
                <p className="text-2xl font-bold">{stats.maxWinStreak}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('max_loss_streak')}</p>
                <p className="text-2xl font-bold">{stats.maxLossStreak}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('current_bet_amount')}</p>
                <p className="text-2xl font-bold">{stats.currentBetAmount.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('initial_balance')}</p>
                <p className="text-2xl font-bold">{stats.initialBalance.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('current_balance')}</p>
                <p className="text-2xl font-bold">{stats.currentBalance.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-gray-400">{t('profit_percentage')}</p>
                <p className={`text-2xl font-bold ${stats.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.profitPercentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BetHistory />
    </main>
  );
}