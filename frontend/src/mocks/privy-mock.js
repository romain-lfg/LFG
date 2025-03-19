
// Mock for Privy during SSR
module.exports = {
  usePrivy: () => ({}),
  useWallets: () => ({ wallets: [] }),
  PrivyProvider: ({ children }) => ({ type: 'div', props: { children } })
};
