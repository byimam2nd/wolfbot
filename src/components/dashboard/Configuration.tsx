'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BettingConfig } from '../../app/lib/wolfbet';

interface ConfigurationProps {
  config: BettingConfig;
  handleConfigChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  loadingStrategies: boolean;
}

export default function Configuration({
  config,
  handleConfigChange,
  loadingStrategies,
}: ConfigurationProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('configuration')}</h2>
      {loadingStrategies ? (
        <p className="text-gray-400">{t('loading_configuration')}...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm">{t('base_bet')}</label>
            <input
              type="number"
              name="baseBet"
              value={config.baseBet}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('payout_multiplier')}</label>
            <input
              type="number"
              name="payoutMultiplier"
              value={config.payoutMultiplier}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('stop_on_win_profit')}</label>
            <input
              type="number"
              name="stopOnWin"
              value={config.stopOnWin}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('stop_on_loss')}</label>
            <input
              type="number"
              name="stopOnLoss"
              value={config.stopOnLoss}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('stop_on_win_percentage')}</label>
            <input
              type="number"
              name="stopOnWinPercentage"
              value={config.stopOnWinPercentage || 0}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('stop_on_loss_percentage')}</label>
            <input
              type="number"
              name="stopOnLossPercentage"
              value={config.stopOnLossPercentage || 0}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('bet_rule')}</label>
            <select
              name="betRule"
              value={config.betRule}
              onChange={handleConfigChange}
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
              value={config.betChance}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="any"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('client_seed')}</label>
            <input
              type="text"
              name="clientSeed"
              value={config.clientSeed}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">{t('server_seed')}</label>
            <input
              type="text"
              name="serverSeed"
              value={config.serverSeed}
              onChange={handleConfigChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Increase on Win */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mt-4 mb-2">{t('increase_on_win')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">{t('type')}</label>
                <select
                  name="increaseOnWin.type"
                  value={config.increaseOnWin.type}
                  onChange={handleConfigChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">{t('none')}</option>
                  <option value="percentage">{t('percentage')}</option>
                  <option value="fixed">{t('fixed')}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('value')}</label>
                <input
                  type="number"
                  name="increaseOnWin.value"
                  value={config.increaseOnWin.value}
                  onChange={handleConfigChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="any"
                  disabled={config.increaseOnWin.type === 'none'}
                />
              </div>
              <div className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  id="increaseOnWin.resetBaseBet"
                  name="increaseOnWin.resetBaseBet"
                  checked={config.increaseOnWin.resetBaseBet}
                  onChange={handleConfigChange}
                  className="mr-2"
                />
                <label htmlFor="increaseOnWin.resetBaseBet">
                  {t('reset_base_bet_on_win')}
                </label>
              </div>
            </div>
          </div>

          {/* Increase on Loss */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mt-4 mb-2">{t('increase_on_loss')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">{t('type')}</label>
                <select
                  name="increaseOnLoss.type"
                  value={config.increaseOnLoss.type}
                  onChange={handleConfigChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">{t('none')}</option>
                  <option value="percentage">{t('percentage')}</option>
                  <option value="fixed">{t('fixed')}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">{t('value')}</label>
                <input
                  type="number"
                  name="increaseOnLoss.value"
                  value={config.increaseOnLoss.value}
                  onChange={handleConfigChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="any"
                  disabled={config.increaseOnLoss.type === 'none'}
                />
              </div>
              <div className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  id="increaseOnLoss.resetBaseBet"
                  name="increaseOnLoss.resetBaseBet"
                  checked={config.increaseOnLoss.resetBaseBet}
                  onChange={handleConfigChange}
                  className="mr-2"
                />
                <label htmlFor="increaseOnLoss.resetBaseBet">
                  {t('reset_base_bet_on_loss')}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
