'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ManualBetConfig {
  amount: number;
  betRule: 'over' | 'under';
  betChance: number;
}

interface ManualBetProps {
  manualBetConfig: ManualBetConfig;
  handleManualBetChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleManualBet: () => void;
  loadingManualBet: boolean;
}

export default function ManualBet({
  manualBetConfig,
  handleManualBetChange,
  handleManualBet,
  loadingManualBet,
}: ManualBetProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('manual_bet')}</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm">{t('amount')}</label>
          <input
            type="number"
            name="amount"
            value={manualBetConfig.amount}
            onChange={handleManualBetChange}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step="any"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">{t('bet_rule')}</label>
          <select
            name="betRule"
            value={manualBetConfig.betRule}
            onChange={handleManualBetChange}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="over">{t('over')}</option>
            <option value="under">{t('under')}</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm">{t('bet_chance')}</label>
          <input
            type="number"
            name="betChance"
            value={manualBetConfig.betChance}
            onChange={handleManualBetChange}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step="any"
          />
        </div>
      </div>
      <button
        onClick={handleManualBet}
        disabled={loadingManualBet}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors duration-200"
      >
        {loadingManualBet ? t('placing_bet') : t('place_manual_bet')}
      </button>
    </div>
  );
}
