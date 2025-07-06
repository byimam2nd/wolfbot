'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BotStats {
  currentBetAmount: number;
  currentProfit: number;
  totalBets: number;
  wins: number;
  losses: number;
  winStreak: number;
  lossStreak: number;
  maxWinStreak: number;
  maxLossStreak: number;
  initialBalance: number;
  currentBalance: number;
  profitPercentage: number;
}

interface LiveStatsProps {
  stats: BotStats;
  loadingStatus: boolean;
}

export default function LiveStats({
  stats,
  loadingStatus,
}: LiveStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('live_stats')}</h2>
      {loadingStatus ? (
        <p className="text-gray-400">{t('loading_stats')}...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-400">{t('total_profit')}</p>
            <p className={`text-2xl font-bold ${stats.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.currentProfit.toFixed(8)}
            </p>
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
            <p className={`text-2xl font-bold ${stats.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.profitPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}