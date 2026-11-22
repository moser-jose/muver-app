import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

import { messages as en } from './en';
import { messages as pt } from './pt';

export type Lingua = 'pt' | 'en';

// Mudam com mudarLingua(); quem importa vê sempre o valor actual
export let lingua: Lingua;
export let idioma: string; // para a TMDB
export let regiao: string; // país das estreias e do streaming
let dic: any;

function aplicar(l: Lingua) {
  lingua = l;
  idioma = l === 'en' ? 'en-US' : 'pt-PT';
  regiao = l === 'en' ? 'US' : 'PT';
  dic = l === 'en' ? en.en.translations : pt.pt.translations;
}

// A escolha guardada manda; sem ela segue o telemóvel: inglês se for inglês, português para o resto
const guardada = Storage.getItemSync('lingua');
aplicar(guardada === 'pt' || guardada === 'en' ? guardada : Intl.DateTimeFormat().resolvedOptions().locale.startsWith('en') ? 'en' : 'pt');

const ouvintes = new Set<() => void>();
export function mudarLingua(l: Lingua) {
  aplicar(l);
  Storage.setItemSync('lingua', l);
  ouvintes.forEach((avisar) => avisar());
}
// O layout de raiz usa isto como `key` para redesenhar a app toda na língua nova
export const useLingua = () =>
  useSyncExternalStore(
    (avisar) => {
      ouvintes.add(avisar);
      return () => ouvintes.delete(avisar);
    },
    () => lingua,
  );

export const t = (chave: string): string => chave.split('.').reduce((o, k) => o?.[k], dic) ?? chave;

// Textos traduzidos têm de ser pedidos ao desenhar (não em constantes de módulo), senão ficam na língua antiga
export const periodos = (): ['day' | 'week', string][] => [['day', t('ui.dia')], ['week', t('ui.semana')]];
