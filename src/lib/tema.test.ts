const kv: Map<string, string> = (globalThis as any).__kv;
// o módulo aplica o tema guardado ao ser carregado: cada teste carrega-o de novo
const carregar = () => {
  jest.resetModules();
  const aplicar = jest.spyOn(require('react-native').Appearance, 'setColorScheme').mockImplementation(() => {});
  return { tema: require('./tema') as typeof import('./tema'), aplicar };
};

beforeEach(() => kv.clear());
afterEach(() => jest.restoreAllMocks());

test('sem escolha guardada segue o telemóvel e não força nada', () => {
  const { tema, aplicar } = carregar();
  expect(tema.temaGuardado()).toBe('auto');
  expect(aplicar).not.toHaveBeenCalled();
});

test('o tema guardado é aplicado ao abrir a app', () => {
  kv.set('tema', 'dark');
  const { tema, aplicar } = carregar();
  expect(tema.temaGuardado()).toBe('dark');
  expect(aplicar).toHaveBeenCalledWith('dark');
});

test('um valor guardado inválido conta como automático', () => {
  kv.set('tema', 'roxo');
  expect(carregar().tema.temaGuardado()).toBe('auto');
});

test('mudarTema guarda e aplica a escolha', () => {
  const { tema, aplicar } = carregar();
  tema.mudarTema('light');
  expect(kv.get('tema')).toBe('light');
  expect(aplicar).toHaveBeenLastCalledWith('light');
});

test('voltar a automático devolve o controlo ao telemóvel', () => {
  kv.set('tema', 'dark');
  const { tema, aplicar } = carregar();
  tema.mudarTema('auto');
  expect(tema.temaGuardado()).toBe('auto');
  expect(aplicar).toHaveBeenLastCalledWith('unspecified');
});
