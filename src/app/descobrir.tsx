import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Aviso, Carregar, Chips, Texto } from '@/components/base';
import { Grelha } from '@/components/cartoes';
import { usePaginas, useTmdb } from '@/lib/api';
import { regiao, t } from '@/lib/i18n';

// parâmetro do /discover da TMDB para cada tipo de lista ("tudo" não tem)
const CAMPO: Record<string, string> = {
  genero: 'with_genres', keyword: 'with_keywords', produtora: 'with_companies', provedor: 'with_watch_providers',
  canal: 'with_networks', pessoa: 'with_cast', idioma: 'with_original_language', pais: 'with_origin_country',
};
// tipos que existem tanto para filmes como para séries (géneros têm ids diferentes; elenco e canal são só de um)
const DOIS_MEDIA = ['tudo', 'keyword', 'produtora', 'provedor', 'idioma', 'pais'];
// opções dos filtros; é uma função para os textos saírem na língua actual
const opcoes = () => {
  const todos: [string, string] = ['', t('ui.todos')];
  const esteAno = new Date().getFullYear();
  return {
    idiomas: [todos, ['pt', 'Português'], ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['de', 'Deutsch'], ['ja', '日本語'], ['ko', '한국어'], ['zh', '中文'], ['hi', 'हिन्दी']] as [string, string][],
    anos: [todos, ...Array.from({ length: esteAno - 1949 }, (_, i): [string, string] => [String(esteAno + 1 - i), String(esteAno + 1 - i)])],
    notas: [todos, ...[9, 8, 7, 6, 5].map((n): [string, string] => [String(n), `${n}+`])],
    ordens: [['popularity.desc', t('ui.ord_popularidade')], ['vote_average.desc', t('ui.ord_nota')], ['data', t('ui.ord_data')]] as [string, string][],
    medias: [['movie', t('ui.filmes')], ['tv', t('header.series')]] as ['movie' | 'tv', string][],
  };
};

// Filmes de uma colecção (lista fechada, sem filtros nem páginas)
function Coleccao({ id, nome }: { id: string; nome?: string }) {
  const { data, erro, repetir } = useTmdb(`/collection/${id}`);
  if (erro) return <Aviso repetir={repetir} />;
  if (!data) return <Carregar />;
  return (
    <>
      <Stack.Screen options={{ title: data.name || nome }} />
      <Grelha media="movie" itens={data.parts} cabecalho={data.overview ? <Texto mudo style={{ padding: 16, paddingBottom: 0 }}>{data.overview}</Texto> : undefined} />
    </>
  );
}

function Descoberta({ tipo, id, nome, mediaInicial }: { tipo: string; id?: string; nome?: string; mediaInicial: 'movie' | 'tv' }) {
  const [media, setMedia] = useState(mediaInicial);
  const [f, setF] = useState({ ordem: 'popularity.desc', ano: '', nota: '', lingua: '' });
  const mudar = (campo: keyof typeof f) => (v: string) => setF({ ...f, [campo]: v });
  const tv = media === 'tv';
  const o = opcoes();
  const lista = usePaginas(`/discover/${media}`, {
    sort_by: f.ordem === 'data' ? (tv ? 'first_air_date.desc' : 'primary_release_date.desc') : f.ordem,
    [tv ? 'first_air_date_year' : 'primary_release_year']: f.ano,
    'vote_average.gte': f.nota,
    // sem um mínimo de votos, a ordenação por nota enche-se de títulos com um único voto 10
    'vote_count.gte': f.ordem === 'vote_average.desc' || f.nota ? 200 : undefined,
    with_original_language: f.lingua,
    watch_region: tipo === 'provedor' ? regiao : undefined,
    ...(CAMPO[tipo] && id ? { [CAMPO[tipo]]: tipo === 'pais' ? id.toUpperCase() : id } : {}),
  });
  const titulo = tipo === 'tudo' ? t(tv ? 'ui.explorar_series' : 'ui.explorar_filmes') : nome || t('ui.explorar');
  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      <Grelha
        {...lista}
        media={media}
        onFim={lista.mais}
       
        cabecalho={
          <View style={{ paddingTop: 12, gap: 10 }}>
            {DOIS_MEDIA.includes(tipo) && <Chips rotulo={t('ui.tipo')} opcoes={o.medias} valor={media} onChange={setMedia} />}
            <Chips rotulo={t('ui.ordenar')} opcoes={o.ordens} valor={f.ordem} onChange={mudar('ordem')} />
            <Chips rotulo={t('ui.nota_minima')} opcoes={o.notas} valor={f.nota} onChange={mudar('nota')} />
            <Chips rotulo={t('ui.ano')} opcoes={o.anos} valor={f.ano} onChange={mudar('ano')} />
            {tipo !== 'idioma' && <Chips rotulo={t('ui.idioma_original')} opcoes={o.idiomas} valor={f.lingua} onChange={mudar('lingua')} />}
            {!lista.aCarregar && lista.total > 0 && (
              <Texto mudo style={{ paddingHorizontal: 16 }}>{lista.total} {tv ? t('ui.n_series') : t('ui.n_filmes')}</Texto>
            )}
          </View>
        }
      />
    </>
  );
}

// Listas por género, palavra-chave, produtora, streaming, canal, pessoa, idioma, país ou colecção
export default function Descobrir() {
  const { tipo = 'tudo', id, nome, media } = useLocalSearchParams<{ tipo?: string; id?: string; nome?: string; media?: string }>();
  if (tipo === 'coleccao' && id) return <Coleccao id={id} nome={nome} />;
  return <Descoberta tipo={tipo} id={id} nome={nome} mediaInicial={media === 'tv' ? 'tv' : 'movie'} />;
}
