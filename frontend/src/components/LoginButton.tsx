'use client';

import { usePrivy } from '@privy-io/react-auth';

export const LoginButton = () => {
  const { login, authenticated, ready } = usePrivy();

  if (!ready) return null;

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {authenticated ? 'Connected' : 'Connect Wallet'}
    </button>
  );
};
