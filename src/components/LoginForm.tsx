'use client';

import { useState } from 'react';
import { login } from '../app/actions'; // Import the server action
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  availableSites: string[];
  onLoginSuccess: (apiKey: string, siteName: string) => void;
}

export default function LoginForm({ availableSites, onLoginSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const [siteName, setSiteName] = useState(availableSites[0] || '');
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const result = await login(siteName, apiKey);

    if (result.success) {
      setMessage(t('login_successful'));
      onLoginSuccess(apiKey, siteName); // Pass the API key and siteName back to the parent
      setLoginSuccess(true);
    } else {
      setMessage(t(result.message || 'an_unexpected_error_occurred'));
      setLoginSuccess(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">{t('login_to_dice_site')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-300">{t('dice_site')}</label>
          <select
            id="siteName"
            name="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          >
            {availableSites.map((site) => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">{t('api_key')}</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={t('enter_your_api_key')}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('logging_in') : t('login')}
        </button>
        {message && loginSuccess !== null && (
          <p className={`text-center text-sm ${loginSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}