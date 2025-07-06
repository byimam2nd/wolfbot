'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface UserData {
  username: string;
  balance: number;
  currency: string;
}

interface UserInformationProps {
  userData: UserData | null;
  loadingUserData: boolean;
}

export default function UserInformation({
  userData,
  loadingUserData,
}: UserInformationProps) {
  const { t } = useTranslation();

  if (loadingUserData) {
    return (
      <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex items-center justify-center">
        <p className="text-gray-400">{t('loading_user_data')}...</p>
      </div>
    );
  }

  if (!userData) {
    return null; // Or a message indicating no user data
  }

  return (
    <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
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
  );
}
