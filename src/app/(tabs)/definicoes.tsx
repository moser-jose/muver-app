import { CheckCircleIcon } from '@solar-icons/react-native/bold/check-circle';
import { ArrowRightUpIcon } from '@solar-icons/react-native/linear/arrow-right-up';
import { CodeSquareIcon } from '@solar-icons/react-native/linear/code-square';
import { GlobalIcon } from '@solar-icons/react-native/linear/global';
import { MoonIcon } from '@solar-icons/react-native/linear/moon';
import { ShieldCheckIcon } from '@solar-icons/react-native/linear/shield-check';
import { SmartphoneIcon } from '@solar-icons/react-native/linear/smartphone';
import { SunIcon } from '@solar-icons/react-native/linear/sun';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { ComponentType, ReactNode } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { Texto, TituloAba } from '@/components/base';
import { mudarLingua, t, useLingua } from '@/lib/i18n';
import { DESTAQUE, mudarTema, Tema, useCores, useTema } from '@/lib/tema';

type Icone = ComponentType<{ size?: number; color?: string }>;

// Cartão com um título por cima e linhas separadas por um traço
function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  const c = useCores();
  return (
    <View style={{ marginHorizontal: 16, marginTop: 22, gap: 8 }}>
      <Texto mudo accessibilityRole="header" style={{ fontSize: 13, fontWeight: '600', paddingHorizontal: 4 }}>{titulo.toUpperCase()}</Texto>
      <View style={{ backgroundColor: c.superficie, borderRadius: 16, borderWidth: 1, borderColor: c.borda, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

// Linha de escolha (com visto quando activa) ou de link externo (com seta)
function Linha({ icone: Ic, texto, detalhe, activa, url, onPress, primeira }: { icone: Icone; texto: string; detalhe?: string; activa?: boolean; url?: string; onPress?: () => void; primeira?: boolean }) {
  const c = useCores();
  return (
    <Pressable
      accessibilityRole={url ? 'link' : 'radio'}
      accessibilityState={url ? undefined : { checked: !!activa }}
      onPress={url ? () => Linking.openURL(url).catch(() => {}) : onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderTopWidth: primeira ? 0 : 1, borderTopColor: c.borda, opacity: pressed ? 0.6 : 1 })}>
      <Ic size={22} color={activa ? DESTAQUE : c.texto} />
      <View style={{ flex: 1 }}>
        <Texto style={{ fontSize: 16, fontWeight: activa ? '600' : '400' }}>{texto}</Texto>
        {detalhe && <Texto mudo style={{ fontSize: 12 }}>{detalhe}</Texto>}
      </View>
      {url ? <ArrowRightUpIcon size={18} color={c.mudo} /> : activa && <CheckCircleIcon size={22} color={DESTAQUE} />}
    </Pressable>
  );
}

const TEMAS: [Tema, string, Icone][] = [['auto', 'ui.sistema', SmartphoneIcon], ['light', 'ui.claro', SunIcon], ['dark', 'ui.escuro', MoonIcon]];

// A colecção Solar não tem logótipos de marcas: estes dois são os mesmos desenhos (Feather) usados em moserjose.com
const marca = (formas: ReactNode): Icone =>
  function Marca({ size = 24, color = '#fff' }) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        {formas}
      </Svg>
    );
  };
const LinkedInIcon = marca(
  <>
    <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <Rect x="2" y="9" width="4" height="12" />
    <Circle cx="4" cy="4" r="2" />
  </>,
);
const InstagramIcon = marca(
  <>
    <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <Line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>,
);

const AUTOR: [string, string, Icone][] = [
  ['moserjose.com', 'https://moserjose.com/', GlobalIcon],
  ['LinkedIn', 'https://www.linkedin.com/in/moser-jose/', LinkedInIcon],
  ['Instagram', 'https://www.instagram.com/mosmmy/', InstagramIcon],
];

export default function Definicoes() {
  const c = useCores();
  const lingua = useLingua();
  const tema = useTema();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 120 }}>
      <TituloAba>{t('ui.definicoes')}</TituloAba>

      <Grupo titulo={t('ui.idioma')}>
        <Linha primeira icone={GlobalIcon} texto="Português" detalhe={t('ui.idioma_pt')} activa={lingua === 'pt'} onPress={() => mudarLingua('pt')} />
        <Linha icone={GlobalIcon} texto="English" detalhe={t('ui.idioma_en')} activa={lingua === 'en'} onPress={() => mudarLingua('en')} />
      </Grupo>

      <Grupo titulo={t('ui.tema')}>
        {TEMAS.map(([valor, chave, icone], i) => (
          <Linha
            key={valor}
            primeira={i === 0}
            icone={icone}
            texto={t(chave)}
            activa={tema === valor}
            onPress={() => mudarTema(valor)}
          />
        ))}
      </Grupo>

      <Grupo titulo={t('ui.sobre')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <Image source={require('@/assets/images/icon.png')} style={{ width: 52, height: 52, borderRadius: 12 }} accessibilityLabel="Muver" />
          <View style={{ flex: 1, gap: 2 }}>
            <Texto style={{ fontSize: 16, fontWeight: '700' }}>Muver <Texto mudo style={{ fontWeight: '400', fontSize: 13 }}>v{Constants.expoConfig?.version}</Texto></Texto>
            <Texto mudo style={{ fontSize: 13 }}>{t('ui.rodape_sobre')}</Texto>
          </View>
        </View>
        <Linha icone={GlobalIcon} texto="muver.moserjose.com" url="https://muver.moserjose.com/" />
        <Linha icone={CodeSquareIcon} texto={t('header.github')} detalhe={t('ui.rodape_contribua')} url="https://github.com/moser-jose/muver" />
      </Grupo>

      <Grupo titulo={t('ui.legal')}>
        {/* a mesma página que está indicada na App Store e no Google Play */}
        <Linha primeira icone={ShieldCheckIcon} texto={t('ui.privacidade')} detalhe={t('ui.privacidade_resumo')} url="https://muver.moserjose.com/privacidade" />
      </Grupo>

      {/* site e redes do autor, só em ícones */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 28 }}>
        {AUTOR.map(([nome, url, Ic]) => (
          <Pressable
            key={nome}
            accessibilityRole="link"
            accessibilityLabel={`Moser José · ${nome}`}
            onPress={() => Linking.openURL(url).catch(() => {})}
            style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: c.superficie, borderWidth: 1, borderColor: c.borda, opacity: pressed ? 0.6 : 1 })}>
            <Ic size={24} color={c.texto} />
          </Pressable>
        ))}
      </View>

      <View style={{ padding: 20, paddingTop: 14, gap: 6 }}>
        <Texto mudo style={{ fontSize: 12, textAlign: 'center' }}>Muver © {new Date().getFullYear()} · {t('ui.por')} Moser José</Texto>
        <Texto mudo style={{ fontSize: 12, textAlign: 'center' }}>{t('ui.tmdb')}</Texto>
      </View>
    </ScrollView>
  );
}
