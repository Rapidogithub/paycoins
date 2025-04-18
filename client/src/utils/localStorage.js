// LocalStorage keys
const KEYS = {
  USER: 'wallet_user',
  TOKEN: 'wallet_token',
  WALLET: 'wallet_data',
  TRANSACTIONS: 'wallet_transactions'
};

// User storage functions
export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(KEYS.USER);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const storeUser = (user) => {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user in localStorage:', error);
  }
};

// Token storage functions
export const getStoredToken = () => {
  return localStorage.getItem(KEYS.TOKEN);
};

export const storeToken = (token) => {
  localStorage.setItem(KEYS.TOKEN, token);
};

export const removeToken = () => {
  localStorage.removeItem(KEYS.TOKEN);
};

// Wallet storage functions
export const getStoredWallet = () => {
  try {
    const storedWallet = localStorage.getItem(KEYS.WALLET);
    return storedWallet ? JSON.parse(storedWallet) : null;
  } catch (error) {
    console.error('Error getting wallet from localStorage:', error);
    return null;
  }
};

export const storeWallet = (wallet) => {
  try {
    localStorage.setItem(KEYS.WALLET, JSON.stringify(wallet));
  } catch (error) {
    console.error('Error storing wallet in localStorage:', error);
  }
};

// Transaction storage functions
export const getStoredTransactions = () => {
  try {
    const storedTransactions = localStorage.getItem(KEYS.TRANSACTIONS);
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  } catch (error) {
    console.error('Error getting transactions from localStorage:', error);
    return [];
  }
};

export const storeTransactions = (transactions) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error storing transactions in localStorage:', error);
  }
};

// Clear all wallet app data
export const clearAllData = () => {
  localStorage.removeItem(KEYS.USER);
  localStorage.removeItem(KEYS.TOKEN);
  localStorage.removeItem(KEYS.WALLET);
  localStorage.removeItem(KEYS.TRANSACTIONS);
}; 