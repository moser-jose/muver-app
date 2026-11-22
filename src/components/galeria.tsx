import { CloseCircleIcon } from '@solar-icons/react-native/bold/close-circle';
import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { img } from '@/lib/api';
import { t } from '@/lib/i18n';
import { useCores } from '@/lib/tema';

import { Seccao } from './base';

// Galeria de imagens: fila de miniaturas; tocar numa abre-a em ecrã inteiro dentro da app,
// onde se passa para as outras deslizando para o lado. `retrato` é para fotos de pessoas.
export function Galeria({ imagens, retrato }: { imagens: { file_path: string }[]; retrato?: boolean }) {
  const c = useCores();
  const { width, height } = useWindowDimensions();
  const topo = useSafeAreaInsets().top;
  const [aberta, setAberta] = useState<number | null>(null); // índice da imagem aberta
  const [actual, setActual] = useState(0);
  const lista = imagens.slice(0, 30);
  if (!lista.length) return null;
  const fechar = () => setAberta(null);
  return (
    <Seccao titulo={t('ui.galeria')}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
        {lista.map((i, n) => (
          <Pressable
            key={i.file_path}
            accessibilityRole="imagebutton"
            accessibilityLabel={`${t('ui.imagens')} ${n + 1}`}
            onPress={() => {
              setActual(n);
              setAberta(n);
            }}>
            <Image
              source={img(i.file_path, retrato ? 'w342' : 'w780')}
              style={{ width: retrato ? 150 : 280, aspectRatio: retrato ? 2 / 3 : 16 / 9, borderRadius: 10, backgroundColor: c.superficie }}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={aberta !== null} animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={fechar}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <FlatList
            key={width} // recomeça alinhada quando a largura muda (abrir/fechar o Duo, rodar)
            horizontal
            pagingEnabled
            data={lista}
            keyExtractor={(i) => i.file_path}
            initialScrollIndex={actual}
            getItemLayout={(_, n) => ({ length: width, offset: width * n, index: n })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setActual(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => <Image source={img(item.file_path, retrato ? 'h632' : 'w1280')} style={{ width, height }} contentFit="contain" transition={150} />}
          />
          <Text style={{ position: 'absolute', top: topo + 18, left: 20, color: '#fff', fontWeight: '600' }}>
            {actual + 1} / {lista.length}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('ui.fechar')} onPress={fechar} hitSlop={10} style={{ position: 'absolute', top: topo + 8, right: 14 }}>
            <CloseCircleIcon size={38} color="#fff" />
          </Pressable>
        </View>
      </Modal>
    </Seccao>
  );
}
