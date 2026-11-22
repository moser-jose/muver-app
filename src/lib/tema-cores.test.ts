import { act, renderHook } from '@testing-library/react-native';
import { Appearance } from 'react-native';

import { mudarTema, useCores, useTema } from './tema';

beforeEach(() => jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

// O sistema só avisa da mudança de tema uns momentos depois; os ecrãs não podem ficar à espera dele,
// senão a app muda de cor aos bocados
test('quem usa as cores muda logo com a escolha, sem esperar pelo aviso do sistema', async () => {
  const { result } = await renderHook(() => [useTema(), useCores().fundo]);
  await act(async () => mudarTema('light'));
  expect(result.current).toEqual(['light', '#f3f4f6']);
  await act(async () => mudarTema('dark'));
  expect(result.current).toEqual(['dark', '#0a0a0b']);
});
