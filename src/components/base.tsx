import { Href, Link } from 'expo-router';
import { ReactNode } from 'react';
import { ArrowRightUpIcon } from '@solar-icons/react-native/linear/arrow-right-up';
import { StarIcon } from '@solar-icons/react-native/bold/star';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Text, TextProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/lib/i18n';
import { DESTAQUE, useCores } from '@/lib/tema';

export function Texto({ mudo, style, ...p }: TextProps & { mudo?: boolean }) {
  const c = useCores();
  return <Text {...p} style={[{ color: mudo ? c.mudo : c.texto }, style]} />;
}

// Título no topo de cada aba (as abas não têm cabeçalho de navegação)
export function TituloAba({ children }: { children: ReactNode }) {
  const topo = useSafeAreaInsets().top;
  // no iOS a lista já desce sozinha abaixo da barra de estado (contentInsetAdjustmentBehavior)
  return (
    <Texto accessibilityRole="header" style={{ fontSize: 30, fontWeight: '700', paddingHorizontal: 16, paddingTop: (Platform.OS === 'ios' ? 0 : topo) + 12, paddingBottom: 12 }}>
      {children}
    </Texto>
  );
}

// Estrela + nota (ou nada se não houver nota)
export function Nota({ valor, cor, tamanho = 12 }: { valor?: number | string; cor?: string; tamanho?: number }) {
  const c = useCores();
  if (!valor) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <StarIcon size={tamanho + 1} color="#f5c518" />
      <Text style={{ color: cor ?? c.mudo, fontSize: tamanho, fontWeight: '600' }}>{typeof valor === 'number' ? valor.toFixed(1) : valor}</Text>
    </View>
  );
}

// Link que sai da app (IMDb, JustWatch, crítica completa)
export function Externo({ url, mudo, children }: { url: string; mudo?: boolean; children: ReactNode }) {
  const c = useCores();
  const cor = mudo ? c.mudo : DESTAQUE;
  return (
    <Pressable accessibilityRole="link" onPress={() => Linking.openURL(url).catch(() => {})} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36 }}>
      <Text style={{ color: cor, fontWeight: mudo ? '400' : '600', fontSize: mudo ? 12 : 14 }}>{children}</Text>
      <ArrowRightUpIcon size={14} color={cor} />
    </Pressable>
  );
}

export const Carregar = () => (
  <View style={{ flex: 1, minHeight: 120, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color={DESTAQUE} size="large" accessibilityLabel={t('home.carregar')} />
  </View>
);

export function Aviso({ titulo = t('ui.erro_titulo'), texto = t('ui.erro_texto'), repetir }: { titulo?: string; texto?: string; repetir?: () => void }) {
  return (
    <View style={{ flex: 1, minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }}>
      <Texto style={{ fontSize: 22, fontWeight: '700' }}>{titulo}</Texto>
      <Texto mudo style={{ textAlign: 'center' }}>{texto}</Texto>
      {repetir && (
        <Pressable accessibilityRole="button" onPress={repetir} style={{ backgroundColor: DESTAQUE, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{t('ui.tentar')}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Escolha única numa fila de botões que desliza para o lado
export function Chips<T extends string>({ rotulo, opcoes, valor, onChange }: { rotulo?: string; opcoes: [T, string][]; valor: T; onChange: (v: T) => void }) {
  const c = useCores();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, alignItems: 'center' }}>
      {rotulo && <Texto mudo style={{ fontSize: 13 }}>{rotulo}</Texto>}
      {opcoes.map(([v, nome]) => {
        const activo = v === valor;
        return (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            onPress={() => onChange(v)}
            style={{ paddingHorizontal: 14, minHeight: 36, justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: activo ? DESTAQUE : c.borda, backgroundColor: activo ? DESTAQUE : c.superficie }}>
            <Text style={{ color: activo ? '#fff' : c.texto, fontSize: 13 }}>{nome}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Etiqueta que leva a outro ecrã (género, palavra-chave, país…)
export function Etiqueta({ href, children }: { href: Href; children: ReactNode }) {
  const c = useCores();
  return (
    <Link href={href} asChild>
      <Pressable style={{ paddingHorizontal: 12, minHeight: 34, justifyContent: 'center', borderRadius: 17, borderWidth: 1, borderColor: c.borda, backgroundColor: c.superficie }}>
        <Texto style={{ fontSize: 13 }}>{children}</Texto>
      </Pressable>
    </Link>
  );
}

export const Etiquetas = ({ children }: { children: ReactNode }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 }}>{children}</View>
);

export function Seccao({ titulo, verMais, children }: { titulo: string; verMais?: Href; children: ReactNode }) {
  return (
    <View style={{ marginTop: 26, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, minHeight: 36 }}>
        <Texto accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', flexShrink: 1 }}>{titulo}</Texto>
        {verMais && (
          <Link href={verMais} style={{ color: DESTAQUE, marginLeft: 'auto', paddingHorizontal: 16, paddingVertical: 8, fontWeight: '600' }}>
            {t('ui.ver_mais')}
          </Link>
        )}
      </View>
      {children}
    </View>
  );
}
