// Armazenamento em memória no lugar do expo-sqlite/kv-store (os testes limpam-no com global.__kv.clear())
global.__kv = new Map();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (k) => (global.__kv.has(k) ? global.__kv.get(k) : null),
    setItemSync: (k, v) => void global.__kv.set(k, v),
  },
}));

// Margens seguras a zero (nos testes não há ecrã real nem SafeAreaProvider)
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
