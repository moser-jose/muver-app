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

test('mudarTema guarda a escolha mas deixa o sistema para depois de os ecrãs mudarem', () => {
  const { tema, aplicar } = carregar();
  tema.mudarTema('light');
  expect(kv.get('tema')).toBe('light');
  expect(tema.temaGuardado()).toBe('light');
  // se o sistema fosse avisado já aqui, a barra de abas mudava de cor antes do resto da app
  expect(aplicar).not.toHaveBeenCalled();
});

test('aplicarTemaNoSistema passa a escolha ao sistema', () => {
  const { tema, aplicar } = carregar();
  tema.aplicarTemaNoSistema('dark');
  expect(aplicar).toHaveBeenLastCalledWith('dark');
});

test('voltar a automático devolve o controlo ao telemóvel', () => {
  kv.set('tema', 'dark');
  const { tema, aplicar } = carregar();
  tema.mudarTema('auto');
  expect(tema.temaGuardado()).toBe('auto');
  tema.aplicarTemaNoSistema('auto');
  expect(aplicar).toHaveBeenLastCalledWith('unspecified');
});
