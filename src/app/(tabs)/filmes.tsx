import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Chips, Etiqueta, Etiquetas } from '@/components/base';
import { Destaque, Fila } from '@/components/cartoes';
import { periodos, regiao, t } from '@/lib/i18n';

const hoje = new Date().toISOString().slice(0, 10);

export default function Filmes() {
  const [periodo, setPeriodo] = useState<'day' | 'week'>('day');
  return (
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: 120 }}>
      <Destaque ateAoTopo media="movie" path="/movie/popular" />
      <View style={{ marginTop: 16 }}>
        <Etiquetas>
          <Etiqueta href={{ pathname: '/descobrir', params: { tipo: 'tudo', media: 'movie' } }}>{t('ui.explorar_filmes')}</Etiqueta>
          <Etiqueta href={{ pathname: '/descobrir', params: { tipo: 'idioma', id: 'pt', nome: t('ui.cinema_pt') } }}>{t('ui.cinema_pt')}</Etiqueta>
        </Etiquetas>
      </View>
      <Fila titulo={t('ui.filmes_populares')} media="movie" path="/movie/popular" />
      <Fila titulo={t('ui.em_cartaz')} media="movie" path="/movie/now_playing" params={{ region: regiao }} />
      <View style={{ marginTop: 26 }}>
        <Chips rotulo={t('ui.tendencias')} opcoes={periodos()} valor={periodo} onChange={setPeriodo} />
      </View>
      <Fila titulo={t('ui.tendencias')} media="movie" path={`/trending/movie/${periodo}`} />
      <Fila titulo={t('ui.actores_populares')} media="person" path="/trending/person/week" verMais="/actores" />
      <Fila titulo={t('ui.maior_pontuacao')} media="movie" path="/movie/top_rated" />
      {/* a TMDB devolve em "upcoming" filmes que já estrearam; ficam só os que ainda vêm */}
      <Fila titulo={t('ui.a_estrear')} media="movie" path="/movie/upcoming" params={{ region: regiao }} filtro={(f) => f.release_date >= hoje} />
    </ScrollView>
  );
}
