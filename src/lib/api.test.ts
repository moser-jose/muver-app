import { act, renderHook, waitFor } from '@testing-library/react-native';

import { img, tmdb, usePaginas, useTmdb } from './api';
import { mudarLingua } from './i18n';

// Resposta falsa da TMDB: cada página traz dois itens identificados pelo pedido e pela página
const pedidos: URL[] = [];
let paginas = 3;
let falhar = false;
const responder = jest.fn(async (endereco: string) => {
  const url = new URL(endereco);
  pedidos.push(url);
  if (falhar) return { ok: false, status: 500, json: async () => ({}) };
  const q = url.searchParams.get('query') ?? 'x';
  const p = Number(url.searchParams.get('page') ?? 1);
  return { ok: true, status: 200, json: async () => ({ results: [{ id: `${q}${p}a` }, { id: `${q}${p}b` }], total_pages: paginas, total_results: paginas * 2 }) };
});
const ids = (itens: any[]) => itens.map((x) => x.id);

beforeAll(() => mudarLingua('pt'));
beforeEach(() => {
  pedidos.length = 0;
  paginas = 3;
  falhar = false;
  responder.mockClear();
  globalThis.fetch = responder as any;
});

test('img monta o endereço da imagem com o tamanho pedido', () => {
  expect(img('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
  expect(img('/abc.jpg', 'w780')).toBe('https://image.tmdb.org/t/p/w780/abc.jpg');
});

describe('tmdb', () => {
  test('pede à TMDB na língua da app, sem conteúdo adulto', async () => {
    await tmdb('/movie/popular');
    expect(pedidos[0].origin + pedidos[0].pathname).toBe('https://api.themoviedb.org/3/movie/popular');
    expect(pedidos[0].searchParams.get('language')).toBe('pt-PT');
    expect(pedidos[0].searchParams.get('include_adult')).toBe('false');
  });

  test('usa a língua nova depois de mudarLingua', async () => {
    mudarLingua('en');
    await tmdb('/movie/popular');
    mudarLingua('pt');
    expect(pedidos[0].searchParams.get('language')).toBe('en-US');
  });

  test('codifica os parâmetros e deixa de fora os vazios', async () => {
    await tmdb('/search/movie', { query: 'coração & ferro', ano: '', nota: undefined, page: 2 });
    expect(pedidos[0].searchParams.get('query')).toBe('coração & ferro');
    expect(pedidos[0].searchParams.get('page')).toBe('2');
    expect(pedidos[0].searchParams.has('ano')).toBe(false);
    expect(pedidos[0].searchParams.has('nota')).toBe(false);
  });

  test('uma resposta de erro da TMDB é lançada como erro', async () => {
    falhar = true;
    await expect(tmdb('/movie/0')).rejects.toThrow('TMDB 500');
  });
});

describe('useTmdb', () => {
  test('sem caminho não faz pedido', async () => {
    const { result } = await renderHook(() => useTmdb(null));
    expect(responder).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.erro).toBe(false);
  });

  test('devolve os dados quando o pedido chega', async () => {
    const { result } = await renderHook(() => useTmdb('/movie/popular'));
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(ids(result.current.data.results)).toEqual(['x1a', 'x1b']);
  });

  test('assinala o erro e volta a pedir com repetir()', async () => {
    falhar = true;
    const { result } = await renderHook(() => useTmdb('/movie/popular'));
    await waitFor(() => expect(result.current.erro).toBe(true));
    falhar = false;
    await act(async () => result.current.repetir());
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.erro).toBe(false);
  });

  test('ignora a resposta de um pedido antigo que chega atrasada', async () => {
    let soltarAntigo = () => {};
    responder.mockImplementationOnce(
      () => new Promise((ok) => (soltarAntigo = () => ok({ ok: true, status: 200, json: async () => ({ results: [{ id: 'antigo' }] }) }))) as any,
    );
    const { result, rerender } = await renderHook(({ q }: { q: string }) => useTmdb('/search/movie', { query: q }), { initialProps: { q: 'a' } });
    await rerender({ q: 'b' });
    await waitFor(() => expect(result.current.data).toBeDefined());
    await act(async () => soltarAntigo());
    expect(ids(result.current.data.results)).toEqual(['b1a', 'b1b']);
  });
});

describe('usePaginas', () => {
  const montar = (q = 'a') => renderHook(({ q }: { q: string }) => usePaginas('/search/movie', { query: q }), { initialProps: { q } });
  const pronto = (result: { current: ReturnType<typeof usePaginas> }) => waitFor(() => expect(result.current.aCarregar).toBe(false));

  test('carrega a primeira página', async () => {
    const { result } = await montar();
    await pronto(result);
    expect(ids(result.current.itens)).toEqual(['a1a', 'a1b']);
    expect(result.current.total).toBe(6);
  });

  test('mais() junta a página seguinte às anteriores', async () => {
    const { result } = await montar();
    await pronto(result);
    await act(async () => void result.current.mais());
    await pronto(result);
    expect(ids(result.current.itens)).toEqual(['a1a', 'a1b', 'a2a', 'a2b']);
    expect(pedidos.map((u) => u.searchParams.get('page'))).toEqual(['1', '2']);
  });

  test('enquanto a página seguinte chega, aCarregar fica activo (spinner) e os itens anteriores mantêm-se', async () => {
    const { result } = await montar();
    await pronto(result);
    let soltar = () => {};
    responder.mockImplementationOnce(() => new Promise((ok) => (soltar = () => ok({ ok: true, status: 200, json: async () => ({ results: [{ id: 'novo' }], total_pages: 3, total_results: 6 }) }))) as any);
    await act(async () => void result.current.mais());
    expect(result.current.aCarregar).toBe(true);
    expect(ids(result.current.itens)).toEqual(['a1a', 'a1b']);
    await act(async () => soltar());
    await pronto(result);
    expect(ids(result.current.itens)).toEqual(['a1a', 'a1b', 'novo']);
  });

  test('chamar mais() várias vezes seguidas pede a página só uma vez', async () => {
    const { result } = await montar();
    await pronto(result);
    await act(async () => {
      result.current.mais();
      result.current.mais();
    });
    await pronto(result);
    expect(pedidos.map((u) => u.searchParams.get('page'))).toEqual(['1', '2']);
  });

  test('não pede nada depois da última página', async () => {
    paginas = 1;
    const { result } = await montar();
    await pronto(result);
    await act(async () => void result.current.mais());
    expect(responder).toHaveBeenCalledTimes(1);
  });

  test('quando o pedido muda recomeça na página 1 e esquece os resultados antigos', async () => {
    const { result, rerender } = await montar('a');
    await pronto(result);
    await act(async () => void result.current.mais());
    await pronto(result);
    await rerender({ q: 'b' });
    await pronto(result);
    expect(ids(result.current.itens)).toEqual(['b1a', 'b1b']);
  });

  test('um erro a meio mantém o que já estava carregado e repetir() volta a tentar', async () => {
    const { result } = await montar();
    await pronto(result);
    falhar = true;
    await act(async () => void result.current.mais());
    await waitFor(() => expect(result.current.erro).toBe(true));
    expect(ids(result.current.itens)).toEqual(['a1a', 'a1b']);
    falhar = false;
    await act(async () => result.current.repetir());
    await waitFor(() => expect(result.current.itens).toHaveLength(4));
    expect(result.current.erro).toBe(false);
  });
});
