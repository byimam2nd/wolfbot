'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface WithdrawalProps {
  withdrawalAmount: number;
  setWithdrawalAmount: (amount: number) => void;
  withdrawalCurrency: string;
  setWithdrawalCurrency: (currency: string) => void;
  withdrawalAddress: string;
  setWithdrawalAddress: (address: string) => void;
  handleWithdraw: () => void;
  loadingWithdrawal: boolean;
}

export default function Withdrawal({
  withdrawalAmount,
  setWithdrawalAmount,
  withdrawalCurrency,
  setWithdrawalCurrency,
  withdrawalAddress,
  setWithdrawalAddress,
  handleWithdraw,
  loadingWithdrawal,
}: WithdrawalProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-3 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('withdrawal')}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm">{t('withdrawal_amount')}</label>
          <input
            type="number"
            name="withdrawalAmount"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step="any"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">{t('withdrawal_currency')}</label>
          <input
            type="text"
            name="withdrawalCurrency"
            value={withdrawalCurrency}
            onChange={(e) => setWithdrawalCurrency(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-1 text-sm">{t('withdrawal_address')}</label>
          <input
            type="text"
            name="withdrawalAddress"
            value={withdrawalAddress}
            onChange={(e) => setWithdrawalAddress(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <button
        onClick={handleWithdraw}
        disabled={loadingWithdrawal}
        className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors duration-200"
      >
        {loadingWithdrawal ? t('processing_withdrawal') : t('initiate_withdrawal')}
      </button>
    </div>
  );
}
