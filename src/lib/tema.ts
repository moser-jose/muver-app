import Storage from 'expo-sqlite/kv-store';
import { Appearance, useColorScheme } from 'react-native';

// Cores do site (app.scss)
export const DESTAQUE = '#ee344c';

const cores = {
  dark: { fundo: '#0a0a0b', superficie: '#17171a', borda: '#303030', texto: '#ffffff', mudo: '#9e9e9e' },
  light: { fundo: '#f3f4f6', superficie: '#ffffff', borda: '#e1e4e9', texto: '#16181d', mudo: '#5b6470' },
};

export const useCores = () => cores[useColorScheme() === 'light' ? 'light' : 'dark'];

// 'auto' segue o telemóvel
export type Tema = 'auto' | 'light' | 'dark';

export const temaGuardado = (): Tema => {
  const v = Storage.getItemSync('tema');
  return v === 'light' || v === 'dark' ? v : 'auto';
};

export function mudarTema(tema: Tema) {
  Storage.setItemSync('tema', tema);
  Appearance.setColorScheme(tema === 'auto' ? 'unspecified' : tema);
}

if (temaGuardado() !== 'auto') Appearance.setColorScheme(temaGuardado());
