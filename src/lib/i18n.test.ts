import { messages as en } from './en';
import { messages as pt } from './pt';

const kv: Map<string, string> = (globalThis as any).__kv;
// o módulo lê a língua guardada ao ser carregado: cada teste carrega-o de novo
const carregar = () => {
  jest.resetModules();
  return require('./i18n') as typeof import('./i18n');
};
const telemovel = (locale: string) => jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({ locale } as any);

beforeEach(() => kv.clear());
afterEach(() => jest.restoreAllMocks());

describe('língua inicial', () => {
  test('a escolha guardada manda sobre o telemóvel', () => {
    telemovel('en-US');
    kv.set('lingua', 'pt');
    const i = carregar();
    expect([i.lingua, i.idioma, i.regiao]).toEqual(['pt', 'pt-PT', 'PT']);
    expect(i.t('header.filme')).toBe('Filmes');
  });

  test('sem escolha: inglês se o telemóvel estiver em inglês', () => {
    telemovel('en-GB');
    const i = carregar();
    expect([i.lingua, i.idioma, i.regiao]).toEqual(['en', 'en-US', 'US']);
  });

  test('sem escolha: português para qualquer outra língua', () => {
    telemovel('fr-FR');
    expect(carregar().lingua).toBe('pt');
  });

  test('um valor guardado inválido é ignorado', () => {
    telemovel('pt-PT');
    kv.set('lingua', 'xx');
    expect(carregar().lingua).toBe('pt');
  });
});

describe('mudarLingua', () => {
  test('troca textos, idioma da TMDB e região, e guarda a escolha', () => {
    kv.set('lingua', 'pt');
    const i = carregar();
    i.mudarLingua('en');
    expect([i.lingua, i.idioma, i.regiao]).toEqual(['en', 'en-US', 'US']);
    expect(i.t('header.filme')).toBe(en.en.translations.header.filme);
    expect(kv.get('lingua')).toBe('en');
    // os textos dos períodos são pedidos na hora, por isso também mudam
    expect(i.periodos()).toEqual([['day', en.en.translations.ui.dia], ['week', en.en.translations.ui.semana]]);
  });
});

describe('t', () => {
  test('uma chave que não existe devolve a própria chave', () => {
    const { t } = carregar();
    expect(t('ui.nao_existe')).toBe('ui.nao_existe');
    expect(t('grupo.que.nao.existe')).toBe('grupo.que.nao.existe');
  });
});

test('português e inglês têm exactamente as mesmas chaves', () => {
  const chaves = (o: any, prefixo = ''): string[] =>
    Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? chaves(v, `${prefixo}${k}.`) : [`${prefixo}${k}`]));
  expect(chaves(en.en.translations).sort()).toEqual(chaves(pt.pt.translations).sort());
});

test('nenhuma tradução está vazia', () => {
  for (const dic of [pt.pt.translations, en.en.translations] as any[])
    for (const grupo of Object.values(dic) as any[]) for (const [k, v] of Object.entries(grupo)) expect([k, String(v).trim().length > 0]).toEqual([k, true]);
});
