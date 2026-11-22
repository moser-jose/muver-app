import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Chips, Etiqueta, Etiquetas } from '@/components/base';
import { Destaque, Fila } from '@/components/cartoes';
import { periodos, t } from '@/lib/i18n';

// Mesma estrutura do ecrã de filmes, com os dados de séries
export default function Series() {
  const [periodo, setPeriodo] = useState<'day' | 'week'>('day');
  return (
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: 120 }}>
      <Destaque ateAoTopo media="tv" path="/tv/popular" />
      <View style={{ marginTop: 16 }}>
        <Etiquetas>
          <Etiqueta href={{ pathname: '/descobrir', params: { tipo: 'tudo', media: 'tv' } }}>{t('ui.explorar_series')}</Etiqueta>
        </Etiquetas>
      </View>
      <Fila titulo={t('ui.series_populares')} media="tv" path="/tv/popular" />
      <Fila titulo={t('ui.hoje_na_tv')} media="tv" path="/tv/airing_today" />
      <View style={{ marginTop: 26 }}>
        <Chips rotulo={t('ui.tendencias')} opcoes={periodos()} valor={periodo} onChange={setPeriodo} />
      </View>
      <Fila titulo={t('ui.tendencias')} media="tv" path={`/trending/tv/${periodo}`} />
      <Fila titulo={t('ui.actores_populares')} media="person" path="/trending/person/week" verMais="/actores" />
      <Fila titulo={t('ui.maior_pontuacao')} media="tv" path="/tv/top_rated" />
      <Fila titulo={t('ui.no_ar')} media="tv" path="/tv/on_the_air" />
    </ScrollView>
  );
}
