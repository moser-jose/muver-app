import { agruparEquipa, ano, classificacao, limita, serieComoFilme } from './dados';

describe('serieComoFilme', () => {
  test('dá à série a forma de um filme', () => {
    const f = serieComoFilme({
      name: 'Dark',
      original_name: 'Dark',
      first_air_date: '2017-12-01',
      external_ids: { imdb_id: 'tt1' },
      keywords: { results: [{ id: 1, name: 'tempo' }] },
      created_by: [{ id: 9, name: 'Baran' }],
      aggregate_credits: {
        cast: [{ id: 1, name: 'A', roles: [{ character: 'Jonas' }] }, { id: 2, name: 'B' }],
        crew: [{ id: 3, name: 'C', jobs: [{ job: 'Writer' }] }, { id: 4, name: 'D', department: 'Sound' }],
      },
    });
    expect(f.title).toBe('Dark');
    expect(f.original_title).toBe('Dark');
    expect(f.release_date).toBe('2017-12-01');
    expect(f.imdb_id).toBe('tt1');
    expect(f.keywords.keywords).toEqual([{ id: 1, name: 'tempo' }]);
    expect(f.credits.cast.map((a: any) => a.character)).toEqual(['Jonas', '']);
    expect(f.credits.crew.map((a: any) => a.job)).toEqual(['Creator', 'Writer', 'Sound']);
  });

  test('numa série ficam todos os papéis e todos os cargos de cada pessoa', () => {
    const f = serieComoFilme({
      name: 'X',
      aggregate_credits: {
        cast: [{ id: 1, roles: [{ character: 'Ana' }, { character: '' }, { character: 'Narradora' }] }],
        crew: [{ id: 2, jobs: [{ job: 'Director' }, { job: 'Writer' }] }],
      },
    });
    expect(f.credits.cast[0].character).toBe('Ana, Narradora');
    expect(f.credits.crew[0].job).toBe('Director, Writer');
  });

  test('aguenta uma série sem elenco nem keywords', () => {
    const f = serieComoFilme({ name: 'X' });
    expect(f.credits).toEqual({ cast: [], crew: [] });
    expect(f.keywords.keywords).toEqual([]);
    expect(f.imdb_id).toBeUndefined();
  });
});

describe('agruparEquipa', () => {
  test('junta os cargos da mesma pessoa, sem repetir', () => {
    const r = agruparEquipa([
      { id: 1, name: 'A', job: 'Director' },
      { id: 2, name: 'B', job: 'Producer' },
      { id: 1, name: 'A', job: 'Writer' },
      { id: 1, name: 'A', job: 'Director' },
    ]);
    expect(r.map((p) => [p.id, p.job])).toEqual([[1, 'Director, Writer'], [2, 'Producer']]);
  });

  test('aguenta entradas sem cargo', () => {
    const r = agruparEquipa([{ id: 1, name: 'A' }, { id: 1, name: 'A', job: 'Editor' }, { id: 1, name: 'A' }]);
    expect(r).toEqual([{ id: 1, name: 'A', job: 'Editor' }]);
  });

  test('junta também os papéis do elenco', () => {
    const r = agruparEquipa(
      [
        { id: 7, name: 'Eddie', character: 'Sherman Klump' },
        { id: 7, name: 'Eddie', character: 'Buddy Love' },
        { id: 8, name: 'Jada', character: 'Carla' },
      ],
      'character',
    );
    expect(r.map((p) => [p.id, p.character])).toEqual([[7, 'Sherman Klump, Buddy Love'], [8, 'Carla']]);
  });

  test('funde listas de cargos que já vêm separadas por vírgula', () => {
    const r = agruparEquipa([{ id: 1, job: 'Creator' }, { id: 1, job: 'Writer, Creator, Producer' }]);
    expect(r).toEqual([{ id: 1, job: 'Creator, Writer, Producer' }]);
  });

  test('não altera a lista original', () => {
    const crew = [{ id: 1, job: 'A' }, { id: 1, job: 'B' }];
    agruparEquipa(crew);
    expect(crew[0].job).toBe('A');
  });
});

describe('classificacao', () => {
  const filme = {
    release_dates: {
      results: [
        { iso_3166_1: 'PT', release_dates: [{ certification: '' }] },
        { iso_3166_1: 'US', release_dates: [{ certification: '' }, { certification: 'PG-13' }] },
      ],
    },
  };

  test('filme: usa o país pedido e cai para os EUA', () => {
    expect(classificacao(filme, 'PT')).toBe('PG-13');
    expect(classificacao(filme, 'US')).toBe('PG-13');
  });

  test('série: lê os content_ratings', () => {
    expect(classificacao({ content_ratings: { results: [{ iso_3166_1: 'PT', rating: 'M/16' }] } }, 'PT')).toBe('M/16');
  });

  test('sem dados não inventa', () => {
    expect(classificacao({}, 'PT')).toBeUndefined();
  });
});

test('limita corta textos longos e aguenta texto em falta', () => {
  expect(limita('abcdef', 3)).toBe('abc…');
  expect(limita('abc def', 4)).toBe('abc…'); // sem espaço antes das reticências
  expect(limita('abc', 3)).toBe('abc');
  expect(limita(undefined, 3)).toBe('');
});

test('ano serve para filmes e para séries', () => {
  expect(ano({ release_date: '2008-05-02' })).toBe('2008');
  expect(ano({ first_air_date: '2017-12-01' })).toBe('2017');
  expect(ano({})).toBe('');
});
