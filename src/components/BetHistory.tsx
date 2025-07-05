'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBetHistory } from '../app/actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface BetRecord {
  id: number;
  site: string;
  amount: number;
  payout: number;
  win: boolean;
  profit: number;
  timestamp: string;
  strategy_name: string;
  bet_parameters: string;
  balance_before_bet: number;
  balance_after_bet: number;
  client_seed_used: string;
  server_seed_used: string;
}

export default function BetHistory() {
  const { t } = useTranslation();
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const result = await getBetHistory();
      if (result.success && result.history) {
        setBetHistory(result.history);
      } else if (result.message) {
        setError(result.message);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-center p-4">{t('loading_bet_history')}</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  // Prepare data for chart
  const chartData = betHistory.map((bet, index) => ({
    name: `Bet ${betHistory.length - index}`,
    profit: bet.profit,
    cumulativeProfit: betHistory.slice(0, index + 1).reduce((sum, b) => sum + b.profit, 0),
  })).reverse(); // Reverse to show oldest first on chart

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold mb-4">{t('bet_history')}</h2>

      {betHistory.length === 0 ? (
        <p className="text-center text-gray-400">{t('no_bet_history')}</p>
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-4">{t('profit_chart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} itemStyle={{ color: '#e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="cumulativeProfit" stroke="#82ca9d" activeDot={{ r: 8 }} name={t('cumulative_profit')} />
            </LineChart>
          </ResponsiveContainer>

          <h3 className="text-xl font-semibold mt-8 mb-4">{t('recent_bets')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('site')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('profit')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('result')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('strategy')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('timestamp')}</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {betHistory.map((bet) => (
                  <tr key={bet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{bet.site}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{bet.amount.toFixed(8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      <span className={`${bet.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bet.profit.toFixed(8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      <span className={`${bet.win ? 'text-green-400' : 'text-red-400'}`}>
                        {bet.win ? t('result_win') : t('result_loss')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{bet.strategy_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{new Date(bet.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
