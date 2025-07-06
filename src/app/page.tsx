'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { login } from './actions'; // Import the server action
import { useTranslation } from 'react-i18next';
import DashboardContent from '../components/DashboardContent';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  const { t } = useTranslation();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const siteName = 'Wolf.bet'; // Hardcode siteName to Wolf.bet

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('wolfbetAccessToken');
      if (storedToken) {
        setApiKey(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    const validateAndSetToken = async () => {
      if (apiKey) {
        setLoading(true);
        const result = await login(siteName, apiKey);
        if (result.success) {
          toast.success(t('login_successful'));
          setAccessToken(apiKey);
          localStorage.setItem('wolfbetAccessToken', apiKey);
        } else {
          toast.error(t(result.message || 'an_unexpected_error_occurred'));
          setAccessToken(null); // Clear access token if login fails
          localStorage.removeItem('wolfbetAccessToken');
        }
        setLoading(false);
      } else {
        setAccessToken(null);
        localStorage.removeItem('wolfbetAccessToken');
      }
    };

    validateAndSetToken();
  }, [apiKey, siteName, t]);

  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">{t('enter_your_api_key')}</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">{t('api_key')}</label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-lg shadow-inner py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-200 ease-in-out"
                placeholder={t('enter_your_api_key')}
                required
              />
            </div>
            {loading && <p className="text-center text-blue-400">{t('validating_token')}</p>}
          </form>
        </div>

        {accessToken && (
          <DashboardContent initialAccessToken={accessToken} siteName={siteName} />
        )}
      </main>
    </ErrorBoundary>
  );
}
