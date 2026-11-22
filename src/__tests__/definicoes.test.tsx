import { fireEvent, render, screen } from '@testing-library/react-native';
import { Appearance, Linking } from 'react-native';

import Definicoes from '@/app/(tabs)/definicoes';
import { lingua, mudarLingua } from '@/lib/i18n';
import { mudarTema } from '@/lib/tema';

jest.mock('expo-router', () => require('@/test/router'));

const kv: Map<string, string> = (globalThis as any).__kv;
beforeEach(() => {
  jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
  mudarTema('auto');
  kv.clear();
  mudarLingua('pt');
});
afterEach(() => jest.restoreAllMocks());

test('mostra as opções de idioma e de tema em português', async () => {
  await render(<Definicoes />);
  for (const texto of ['Definições', 'IDIOMA', 'TEMA', 'Português', 'English', 'Sistema', 'Claro', 'Escuro']) expect(screen.getByText(texto)).toBeTruthy();
  expect(screen.getByRole('radio', { name: /Português/, checked: true })).toBeTruthy();
  expect(screen.getByRole('radio', { name: /English/, checked: false })).toBeTruthy();
});

test('escolher English passa o ecrã para inglês e guarda a escolha', async () => {
  await render(<Definicoes />);
  await fireEvent.press(screen.getByText('English'));
  expect(lingua).toBe('en');
  expect(kv.get('lingua')).toBe('en');
  for (const texto of ['Settings', 'LANGUAGE', 'THEME', 'System', 'Light', 'Dark']) expect(screen.getByText(texto)).toBeTruthy();
  expect(screen.getByRole('radio', { name: /English/, checked: true })).toBeTruthy();
});

test('escolher um tema guarda-o e marca a linha', async () => {
  await render(<Definicoes />);
  expect(screen.getByRole('radio', { name: 'Sistema', checked: true })).toBeTruthy();
  await fireEvent.press(screen.getByText('Escuro'));
  expect(kv.get('tema')).toBe('dark');
  expect(screen.getByRole('radio', { name: 'Escuro', checked: true })).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Sistema', checked: false })).toBeTruthy();
});

test('abre com o tema que ficou guardado', async () => {
  mudarTema('light');
  await render(<Definicoes />);
  expect(screen.getByRole('radio', { name: 'Claro', checked: true })).toBeTruthy();
});

test('os ícones do autor abrem o site, o LinkedIn e o Instagram', async () => {
  const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await render(<Definicoes />);
  for (const [nome, url] of [
    ['moserjose.com', 'https://moserjose.com/'],
    ['LinkedIn', 'https://www.linkedin.com/in/moser-jose/'],
    ['Instagram', 'https://www.instagram.com/mosmmy/'],
  ]) {
    await fireEvent.press(screen.getByLabelText(`Moser José · ${nome}`));
    expect(abrir).toHaveBeenLastCalledWith(url);
  }
});

test('a política de privacidade abre a página pública do Muver', async () => {
  const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await render(<Definicoes />);
  await fireEvent.press(screen.getByText('Política de Privacidade'));
  expect(abrir).toHaveBeenLastCalledWith('https://muver.moserjose.com/privacidade');
});
