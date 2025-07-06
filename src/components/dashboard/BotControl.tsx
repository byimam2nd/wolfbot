'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface BotControlProps {
  status: string;
  accessToken: string;
  setAccessToken: (token: string) => void;
  handleStart: () => void;
  handleStop: () => void;
  loadingStatus: boolean;
}

export default function BotControl({
  status,
  accessToken,
  setAccessToken,
  handleStart,
  handleStop,
  loadingStatus,
}: BotControlProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('bot_control')}</h2>
      <div className="flex items-center mb-4">
        <p className="mr-4">{t('status')}:</p>
        {loadingStatus ? (
          <p className="font-bold text-lg text-gray-400">{t('loading')}...</p>
        ) : (
          <p className={`font-bold text-lg ${status === t('running') ? 'text-green-500' : 'text-yellow-500'}`}>
            {status}
          </p>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleStart}
          disabled={status === t('running')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors duration-200"
        >
          {t('start')}
        </button>
        <button
          onClick={handleStop}
          disabled={status !== t('running')}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors duration-200"
        >
          {t('stop')}
        </button>
      </div>
      <div className="flex flex-col">
        <label htmlFor="accessToken" className="mb-2 font-semibold">
          {t('access_token')}
        </label>
        <input
          id="accessToken"
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('enter_access_token')}
        />
      </div>
    </div>
  );
}
