import { act, fireEvent, render, screen } from '@testing-library/react-native';

import Pesquisa from '@/app/(tabs)/pesquisa';
import { mudarLingua, t } from '@/lib/i18n';

jest.mock('expo-router', () => require('@/test/router'));

// Resposta falsa da TMDB por tipo de pesquisa (/search/movie, /search/tv, …)
let dados: Record<string, any[]> = {};
const pedidos: URL[] = [];
beforeAll(() => mudarLingua('pt'));
beforeEach(() => {
  jest.useFakeTimers();
  dados = {};
  pedidos.length = 0;
  globalThis.fetch = jest.fn(async (endereco: string) => {
    const url = new URL(endereco);
    pedidos.push(url);
    const results = dados[url.pathname.split('/').pop()!] ?? [];
    return { ok: true, status: 200, json: async () => ({ results, total_results: results.length, total_pages: 1 }) };
  }) as any;
});
afterEach(() => jest.useRealTimers());

// escreve no campo e deixa passar a pausa que antecede o pedido
async function pesquisar(texto: string) {
  await fireEvent.changeText(screen.getByPlaceholderText(t('header.pesquisar')), texto);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
}

test('sem nada escrito explica o que fazer e não faz pedidos', async () => {
  await render(<Pesquisa />);
  expect(screen.getByText(t('ui.pesquisa_titulo'))).toBeTruthy();
  expect(screen.getByText(t('ui.pesquisa_dica'))).toBeTruthy();
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test('pesquisa filmes, séries, actores, colecções, produtoras e palavras-chave', async () => {
  dados = {
    movie: [{ id: 1, title: 'The Matrix', release_date: '1999-03-31', vote_average: 8.2, poster_path: '/m.jpg' }],
    tv: [{ id: 2, name: 'Matrix Série', first_air_date: '1993-03-01', vote_average: 0, poster_path: null }],
    person: [{ id: 3, name: 'Matrix Pessoa', profile_path: null, gender: 1 }],
    collection: [{ id: 4, name: 'The Matrix Collection' }],
    company: [{ id: 5, name: 'Matrix Films' }],
    keyword: [{ id: 6, name: 'matrix' }],
  };
  await render(<Pesquisa />);
  await pesquisar('  matrix ');

  expect(screen.queryByText(t('ui.pesquisa_titulo'))).toBeNull();
  for (const texto of ['The Matrix', 'Matrix Série', 'Matrix Pessoa', 'The Matrix Collection', 'Matrix Films', 'matrix']) expect(screen.getByText(texto)).toBeTruthy();
  expect(screen.getByText(`1 ${t('ui.n_filmes')}`)).toBeTruthy();
  expect(screen.getByText(`1 ${t('ui.n_series')}`)).toBeTruthy();

  expect(pedidos.map((u) => u.pathname.replace('/3/search/', '')).sort()).toEqual(['collection', 'company', 'keyword', 'movie', 'person', 'tv']);
  // o termo vai sem os espaços das pontas
  expect(new Set(pedidos.map((u) => u.searchParams.get('query')))).toEqual(new Set(['matrix']));
});

test('não faz um pedido por letra: espera por uma pausa na escrita', async () => {
  await render(<Pesquisa />);
  const campo = screen.getByPlaceholderText(t('header.pesquisar'));
  for (const texto of ['m', 'ma', 'mat']) {
    await fireEvent.changeText(campo, texto);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(100);
    });
  }
  expect(globalThis.fetch).not.toHaveBeenCalled();
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
  expect(new Set(pedidos.map((u) => u.searchParams.get('query')))).toEqual(new Set(['mat']));
});

test('sem resultados diz que não encontrou nada', async () => {
  await render(<Pesquisa />);
  await pesquisar('zzzz');
  expect(screen.getByText(t('ui.nenhum'))).toBeTruthy();
});

test('limpar o campo volta à explicação inicial', async () => {
  dados = { movie: [{ id: 1, title: 'The Matrix' }] };
  await render(<Pesquisa />);
  await pesquisar('matrix');
  await pesquisar('');
  expect(screen.getByText(t('ui.pesquisa_titulo'))).toBeTruthy();
  expect(screen.queryByText('The Matrix')).toBeNull();
});

test('se a TMDB falhar mostra o aviso com o botão de tentar de novo', async () => {
  globalThis.fetch = jest.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })) as any;
  await render(<Pesquisa />);
  await pesquisar('matrix');
  expect(screen.getByText(t('ui.erro_titulo'))).toBeTruthy();
  expect(screen.getByText(t('ui.tentar'))).toBeTruthy();
});
