'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState('Idle');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ profit: 0, wins: 0, losses: 0, risk: 'No Risk' });
  const [config, setConfig] = useState({
    currency: 'usdt',
    amount: '0.0000001',
    divider: '100000',
    chanceOn: '50',
    ifLose: '0',
    ifWin: '0',
    ifWinReset: true,
  });

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/wolfbet/status');
      const data = await response.json();
      setStatus(data.status);
      setStats(data);
    } catch (_error: unknown) {
      console.error('Error fetching status:', _error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'Running') {
        fetchStatus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status]);

  const handleStart = async () => {
    if (!accessToken) {
      setError('Access token is required.');
      return;
    }
    setError('');
    setStatus('Starting...');
    try {
      const response = await fetch('/api/wolfbet/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, config }),
      });
      if (response.ok) {
        setStatus('Running');
        fetchStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to start bot.');
        setStatus('Idle');
      }
    } catch (_error: unknown) {
      setError('An unexpected error occurred.');
      setStatus('Idle');
    }
  };

  const handleStop = async () => {
    setStatus('Stopping...');
    try {
      const response = await fetch('/api/wolfbet/stop', {
        method: 'POST',
      });
      if (response.ok) {
        setStatus('Idle');
      } else {
        setError('Failed to stop bot.');
        setStatus('Running'); // Revert status if stop fails
      }
    } catch (_error: unknown) {
      setError('An unexpected error occurred.');
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-expect-error: Type 'EventTarget & Element' is not assignable to type 'HTMLInputElement | HTMLSelectElement'.
    const val = isCheckbox ? e.target.checked : value;
    setConfig(prev => ({ ...prev, [name]: val }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Wolfbet Bot Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Bot Control</h2>
            <div className="flex items-center mb-4">
              <p className="mr-4">Status:</p>
              <p className={`font-bold text-lg ${status === 'Running' ? 'text-green-500' : 'text-yellow-500'}`}>
                {status}
              </p>
            </div>
            <div className="flex gap-4 mb-4">
              <button onClick={handleStart} disabled={status === 'Running'} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
                Start
              </button>
              <button onClick={handleStop} disabled={status !== 'Running'} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors">
                Stop
              </button>
            </div>
            <div className="flex flex-col">
              <label htmlFor="accessToken" className="mb-2 font-semibold">Access Token</label>
              <input id="accessToken" type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-2 text-white" placeholder="Enter your access token" />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm">Currency</label>
                <input type="text" name="currency" value={config.currency} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Amount</label>
                <input type="text" name="amount" value={config.amount} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Divider</label>
                <input type="text" name="divider" value={config.divider} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Chance</label>
                <input type="text" name="chanceOn" value={config.chanceOn} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Increase on Loss</label>
                <input type="text" name="ifLose" value={config.ifLose} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">Increase on Win</label>
                <input type="text" name="ifWin" value={config.ifWin} onChange={handleConfigChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="ifWinReset" name="ifWinReset" checked={config.ifWinReset} onChange={handleConfigChange} className="mr-2" />
                <label htmlFor="ifWinReset">Reset on Win</label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Live Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-400">Total Profit</p>
                <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.profit.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-gray-400">Wins</p>
                <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
              </div>
              <div>
                <p className="text-gray-400">Losses</p>
                <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
              </div>
              <div>
                <p className="text-gray-400">Risk Level</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.risk}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}