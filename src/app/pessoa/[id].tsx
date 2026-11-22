import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Aviso, Carregar, Externo, Seccao, Texto } from '@/components/base';
import { Fila } from '@/components/cartoes';
import { img, useTmdb } from '@/lib/api';
import { agruparEquipa } from '@/lib/dados';
import { lingua, t } from '@/lib/i18n';
import { DESTAQUE, useCores } from '@/lib/tema';

const porPopularidade = (lista: any[]) => [...lista].sort((a, b) => b.popularity - a.popularity);

export default function Pessoa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useCores();
  const [tudo, setTudo] = useState(false); // biografia completa
  const { data: a, erro, repetir } = useTmdb(`/person/${id}`, {
    append_to_response: 'images,credits,tv_credits,external_ids',
    include_image_language: `null,${lingua}`,
  });
  if (erro) return <Aviso repetir={repetir} />;
  if (!a) return <Carregar />;
  const foto = a.profile_path ? img(a.profile_path, 'w500') : a.gender === 1 ? require('@/assets/images/user-act-f.jpg') : require('@/assets/images/user-act.jpg');
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 60 }}>
      <Stack.Screen options={{ title: a.name }} />
      <View style={{ flexDirection: 'row', gap: 14, padding: 16 }}>
        <Image source={foto} style={{ width: 120, aspectRatio: 2 / 3, borderRadius: 10, backgroundColor: c.superficie }} contentFit="cover" />
        <View style={{ flex: 1, gap: 6 }}>
          <Texto accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700' }}>{a.name}</Texto>
          {a.birthday && <Texto mudo>{[a.birthday, a.deathday].filter(Boolean).join(' – ')}</Texto>}
          {a.place_of_birth && <Texto mudo>{a.place_of_birth}</Texto>}
          {a.also_known_as?.length > 0 && <Texto mudo numberOfLines={2} style={{ fontSize: 12 }}>{a.also_known_as.slice(0, 5).join(' · ')}</Texto>}
          {a.external_ids?.imdb_id && (
            <Externo url={`https://www.imdb.com/name/${a.external_ids.imdb_id}`}>IMDb</Externo>
          )}
        </View>
      </View>
      {!!a.biography && (
        <Pressable accessibilityRole="button" onPress={() => setTudo(!tudo)} style={{ paddingHorizontal: 16 }}>
          <Texto numberOfLines={tudo ? undefined : 6} style={{ lineHeight: 21 }}>{a.biography}</Texto>
          {!tudo && <Text style={{ color: DESTAQUE, fontWeight: '600', paddingVertical: 8 }}>{t('ui.ler_mais')}</Text>}
        </Pressable>
      )}
      <Fila
        titulo={t('ui.part_actor')}
        media="movie"
        itens={porPopularidade(agruparEquipa(a.credits.cast, 'character'))}
        legenda={(f) => f.character}
        verMais={{ pathname: '/descobrir', params: { tipo: 'pessoa', id, nome: a.name } }}
      />
      <Fila titulo={t('ui.part_series')} media="tv" itens={porPopularidade(agruparEquipa(a.tv_credits?.cast || [], 'character'))} legenda={(f) => f.character} />
      <Fila titulo={t('ui.part_equipa')} media="movie" itens={porPopularidade(agruparEquipa(a.credits.crew))} legenda={(f) => f.job} />
      {a.images?.profiles.length > 0 && (
        <Seccao titulo={t('ui.galeria')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {a.images.profiles.slice(0, 12).map((i: any) => (
              <Image key={i.file_path} source={img(i.file_path)} style={{ width: 150, aspectRatio: 2 / 3, borderRadius: 10, backgroundColor: c.superficie }} contentFit="cover" />
            ))}
          </ScrollView>
        </Seccao>
      )}
    </ScrollView>
  );
}
