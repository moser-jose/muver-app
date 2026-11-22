import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Image } from 'expo-image';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';

import { useLingua } from '@/lib/i18n';
import { aplicarTemaNoSistema, DESTAQUE, useClaro, useCores, useTema } from '@/lib/tema';

// Ecrã de abertura dentro da app: o ícone do Muver, igual ao ecrã de abertura nativo (app.json),
// para aparecer também no Expo Go, que não mostra o nativo
function Abertura() {
  const [visivel, setVisivel] = useState(true);
  useEffect(() => {
    const fim = setTimeout(() => setVisivel(false), 1400);
    return () => clearTimeout(fim);
  }, []);
  if (!visivel) return null;
  return (
    <View accessibilityLabel="Muver" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#0a0a0b', alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('@/assets/images/splash-icon.png')} style={{ width: 180, height: 180 }} />
      <StatusBar style="light" />
    </View>
  );
}

// No Expo Go a cor da barra de estado não pode ser definida pelo navegador (dá erro); na build própria pode
const EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export default function Layout() {
  const c = useCores();
  const lingua = useLingua();
  const claro = useClaro();
  const tema = useTema();
  // só depois de os ecrãs estarem redesenhados é que o sistema muda a barra de abas e os cabeçalhos
  useLayoutEffect(() => aplicarTemaNoSistema(tema), [tema]);
  const base = claro ? DefaultTheme : DarkTheme;
  return (
    <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: DESTAQUE, background: c.fundo, card: c.superficie, text: c.texto, border: c.borda } }}>
      {/* tema claro: barra de estado preta; tema escuro: branca. Em todos os ecrãs, sem excepções
          (só o ecrã de abertura, que tem sempre fundo escuro, a põe branca enquanto está visível) */}
      <StatusBar style={claro ? 'dark' : 'light'} />
      {/* a key redesenha todos os ecrãs quando a língua muda */}
      <Stack key={lingua} screenOptions={{ ...(EXPO_GO ? {} : { statusBarStyle: claro ? 'dark' : 'light' }), headerBackButtonDisplayMode: 'minimal', headerTintColor: c.texto, title: '' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="titulo/[media]/[id]" options={{ headerTransparent: true }} />
      </Stack>
      <Abertura />
    </ThemeProvider>
  );
}
