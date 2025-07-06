'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { StrategyConfig } from '../../app/lib/strategies';

interface StrategyManagementProps {
  strategies: StrategyConfig[];
  selectedStrategy: string;
  setSelectedStrategy: (strategy: string) => void;
  newStrategyName: string;
  setNewStrategyName: (name: string) => void;
  newStrategyDescription: string;
  setNewStrategyDescription: (description: string) => void;
  handleSaveStrategy: () => void;
  handleLoadStrategy: () => void;
  handleDeleteStrategy: () => void;
  loadingStrategies: boolean;
}

export default function StrategyManagement({
  strategies,
  selectedStrategy,
  setSelectedStrategy,
  newStrategyName,
  setNewStrategyName,
  newStrategyDescription,
  setNewStrategyDescription,
  handleSaveStrategy,
  handleLoadStrategy,
  handleDeleteStrategy,
  loadingStrategies,
}: StrategyManagementProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('strategy_management')}</h2>
      {loadingStrategies ? (
        <p className="text-gray-400">{t('loading_strategies')}...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">{t('strategy_name')}</label>
              <input
                type="text"
                value={newStrategyName}
                onChange={(e) => setNewStrategyName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('enter_strategy_name')}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">{t('description')}</label>
              <input
                type="text"
                value={newStrategyDescription}
                onChange={(e) => setNewStrategyDescription(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('optional_description')}
              />
            </div>
          </div>
          <button
            onClick={handleSaveStrategy}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            {t('save_current_config_as_strategy')}
          </button>

          <div className="mt-6">
            <label className="block mb-1 text-sm">{t('load_existing_strategy')}</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('select_a_strategy')}</option>
              {strategies.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.description})
                </option>
              ))}
            </select>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleLoadStrategy}
                disabled={!selectedStrategy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors duration-200"
              >
                {t('load_strategy')}
              </button>
              <button
                onClick={handleDeleteStrategy}
                disabled={!selectedStrategy}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors duration-200"
              >
                {t('delete_strategy')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
