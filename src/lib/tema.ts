import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Cores do site (app.scss)
export const DESTAQUE = '#ee344c';

const cores = {
  dark: { fundo: '#0a0a0b', superficie: '#17171a', borda: '#303030', texto: '#ffffff', mudo: '#9e9e9e' },
  light: { fundo: '#f3f4f6', superficie: '#ffffff', borda: '#e1e4e9', texto: '#16181d', mudo: '#5b6470' },
};

// 'auto' segue o telemóvel
export type Tema = 'auto' | 'light' | 'dark';

export const temaGuardado = (): Tema => {
  const v = Storage.getItemSync('tema');
  return v === 'light' || v === 'dark' ? v : 'auto';
};

// A escolha vive aqui, e não só no sistema, para todos os ecrãs mudarem de cor no mesmo instante:
// o aviso do sistema (Appearance) chega uns momentos depois e fazia a app mudar aos bocados
let escolha = temaGuardado();
const ouvintes = new Set<() => void>();

export function mudarTema(tema: Tema) {
  escolha = tema;
  Storage.setItemSync('tema', tema);
  ouvintes.forEach((avisar) => avisar());
}

// Passa a escolha ao sistema, que é quem pinta a barra de abas, os cabeçalhos e o teclado.
// É chamado pelo layout de raiz só depois de os ecrãs já terem sido redesenhados com as cores novas:
// se fosse logo no toque, a barra de abas mudava antes do resto da app.
export const aplicarTemaNoSistema = (tema: Tema) => Appearance.setColorScheme(tema === 'auto' ? 'unspecified' : tema);

// A escolha feita nas Definições
export const useTema = () =>
  useSyncExternalStore(
    (avisar) => {
      ouvintes.add(avisar);
      return () => ouvintes.delete(avisar);
    },
    () => escolha,
  );

// true se a app está em tema claro (escolhido, ou o do telemóvel quando a escolha é 'auto')
export function useClaro() {
  const sistema = useColorScheme();
  const tema = useTema();
  return (tema === 'auto' ? sistema : tema) === 'light';
}

export const useCores = () => cores[useClaro() ? 'light' : 'dark'];

// ao abrir a app ainda não há nada desenhado, por isso aplica-se já
if (escolha !== 'auto') aplicarTemaNoSistema(escolha);
