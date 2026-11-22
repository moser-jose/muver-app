import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Chips } from '@/components/base';
import { Destaque, Fila, Provedores } from '@/components/cartoes';
import { periodos, t } from '@/lib/i18n';

// Página inicial: mistura filmes, séries e actores
export default function Inicio() {
  const [periodo, setPeriodo] = useState<'day' | 'week'>('day');
  return (
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: 120 }}>
      <Destaque ateAoTopo path="/trending/all/week" />
      <Fila titulo={t('ui.filmes_populares')} media="movie" path="/movie/popular" />
      <Fila titulo={t('ui.series_populares')} media="tv" path="/tv/popular" />
      <Fila titulo={t('ui.actores_populares')} media="person" path="/trending/person/week" verMais="/actores" />
      <Provedores />
      <View style={{ marginTop: 26 }}>
        <Chips rotulo={t('ui.tendencias')} opcoes={periodos()} valor={periodo} onChange={setPeriodo} />
      </View>
      <Fila titulo={t('ui.filmes_tendencia')} media="movie" path={`/trending/movie/${periodo}`} />
      <Fila titulo={t('ui.series_tendencia')} media="tv" path={`/trending/tv/${periodo}`} />
      <Fila titulo={t('ui.filmes_maior_pontuacao')} media="movie" path="/movie/top_rated" />
      <Fila titulo={t('ui.series_maior_pontuacao')} media="tv" path="/tv/top_rated" />
    </ScrollView>
  );
}
