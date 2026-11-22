import { useEffect, useState } from 'react';

import { idioma } from './i18n';

type Params = Record<string, string | number | boolean | undefined>;

export const img = (caminho: string, tamanho = 'w342') => `https://image.tmdb.org/t/p/${tamanho}${caminho}`;

export async function tmdb(path: string, params: Params = {}) {
  const todos: Params = { api_key: process.env.EXPO_PUBLIC_TMDB_KEY, language: idioma, include_adult: false, ...params };
  const query = Object.entries(todos)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const r = await fetch(`https://api.themoviedb.org/3${path}?${query}`);
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}

// Um pedido; `path` a null não pede nada. Respostas de pedidos antigos são ignoradas.
export function useTmdb(path: string | null, params: Params = {}) {
  const chave = path && path + JSON.stringify(params);
  const [estado, setEstado] = useState<{ chave?: string | null; data?: any; erro?: boolean }>({});
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    if (!path) return;
    let activo = true;
    tmdb(path, params).then(
      (data) => activo && setEstado({ chave, data }),
      () => activo && setEstado({ chave, erro: true }),
    );
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tentativa]);
  const actual = estado.chave === chave ? estado : {};
  return {
    data: actual.data,
    erro: !!actual.erro,
    repetir: () => {
      setEstado({});
      setTentativa((n) => n + 1);
    },
  };
}

// Lista para scroll infinito: cada mais() junta a página seguinte; recomeça na página 1 quando o pedido muda
export function usePaginas(path: string, params: Params = {}) {
  const chave = path + JSON.stringify(params);
  const [pedido, setPedido] = useState({ chave, pagina: 1 });
  const [s, setS] = useState({ chave: '', itens: [] as any[], pagina: 0, paginas: 1, total: 0, erro: false });
  if (pedido.chave !== chave) setPedido({ chave, pagina: 1 });
  useEffect(() => {
    if (pedido.chave !== chave) return;
    let activo = true;
    tmdb(path, { ...params, page: pedido.pagina }).then(
      (d) =>
        activo &&
        setS((v) => ({
          chave,
          itens: pedido.pagina === 1 ? d.results : [...v.itens, ...d.results],
          pagina: pedido.pagina,
          paginas: Math.min(d.total_pages, 500), // a TMDB não serve páginas acima da 500
          total: d.total_results,
          erro: false,
        })),
      () => activo && setS((v) => ({ ...v, chave, erro: true })),
    );
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido]);
  const pronto = s.chave === chave;
  const aCarregar = !pronto || (s.pagina !== pedido.pagina && !s.erro);
  return {
    itens: pronto ? s.itens : [],
    total: pronto ? s.total : 0,
    aCarregar, // a grelha mostra o spinner no fim enquanto a página seguinte chega
    erro: pronto && s.erro,
    mais: () => !aCarregar && !s.erro && s.pagina < s.paginas && setPedido({ chave, pagina: s.pagina + 1 }),
    repetir: () => setPedido({ ...pedido }),
  };
}
