'use client';

import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import DashboardContent from '../components/DashboardContent';
import { getAvailableSites } from './actions';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);

  useEffect(() => {
    // Initialize accessToken from localStorage on component mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('wolfbetAccessToken');
      setAccessToken(storedToken);
    }

    // Fetch available sites
    const fetchSites = async () => {
      const sites = await getAvailableSites();
      setAvailableSites(sites);
      setLoadingSites(false);
    };
    fetchSites();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (accessToken) {
        localStorage.setItem('wolfbetAccessToken', accessToken);
      } else {
        localStorage.removeItem('wolfbetAccessToken');
      }
    }
  }, [accessToken]);

  const handleLoginSuccess = (token: string, site: string) => {
    setAccessToken(token);
    setSiteName(site);
  };

  if (loadingSites) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <p>Loading available sites...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      {!accessToken ? (
        <LoginForm availableSites={availableSites} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DashboardContent initialAccessToken={accessToken} siteName={siteName!} />
      )}
    </main>
  );
}
