// Funções puras sobre respostas da TMDB (sem imports, para poderem ser testadas com `npm test`)

export const limita = (str = '', n: number) => (str.length > n ? str.slice(0, n).trimEnd() + '…' : str);

export const ano = (item: any) => (item.release_date || item.first_air_date || '').slice(0, 4);

// Converte a resposta de /tv para o formato de filme que os ecrãs já conhecem
export const serieComoFilme = (s: any) => ({
  ...s,
  title: s.name,
  original_title: s.original_name,
  release_date: s.first_air_date,
  imdb_id: s.external_ids?.imdb_id,
  keywords: { keywords: s.keywords?.results || [] },
  credits: {
    // nas séries cada pessoa pode ter vários papéis e vários cargos: ficam todos, separados por vírgula
    cast: (s.aggregate_credits?.cast || []).map((a: any) => ({ ...a, character: (a.roles || []).map((r: any) => r.character).filter(Boolean).join(', ') })),
    crew: [
      ...(s.created_by || []).map((c: any) => ({ ...c, job: 'Creator' })),
      ...(s.aggregate_credits?.crew || []).map((a: any) => ({ ...a, job: (a.jobs || []).map((j: any) => j.job).filter(Boolean).join(', ') || a.department })),
    ],
  },
});

// Uma entrada por pessoa (ou por título, nos créditos de uma pessoa), com todos os cargos ou papéis
// juntos e separados por vírgula, sem repetidos
export const agruparEquipa = (lista: any[], campo: 'job' | 'character' = 'job') => {
  const porId = new Map<number, any>();
  for (const p of lista) {
    const visto = porId.get(p.id) ?? { ...p, [campo]: '' };
    const valores = [visto[campo], p[campo]].flatMap((v) => (v ? String(v).split(', ') : []));
    visto[campo] = [...new Set(valores)].join(', ');
    porId.set(p.id, visto);
  }
  return [...porId.values()];
};

// Classificação etária no país pedido; se não houver, a dos EUA
export const classificacao = (f: any, pais: string): string | undefined => {
  for (const p of [pais, 'US']) {
    const c =
      f.content_ratings?.results?.find((x: any) => x.iso_3166_1 === p)?.rating ||
      f.release_dates?.results?.find((x: any) => x.iso_3166_1 === p)?.release_dates.find((r: any) => r.certification)?.certification;
    if (c) return c;
  }
};
