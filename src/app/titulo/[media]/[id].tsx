import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { PlayCircleIcon } from '@solar-icons/react-native/bold/play-circle';
import { Linking, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso, Carregar, Etiqueta, Etiquetas, Externo, Nota, Seccao, Texto } from '@/components/base';
import { Fila, Logos } from '@/components/cartoes';
import { Galeria } from '@/components/galeria';
import { Temporadas } from '@/components/temporadas';
import { img, useTmdb } from '@/lib/api';
import { agruparEquipa, classificacao, limita, serieComoFilme } from '@/lib/dados';
import { idioma, lingua, regiao, t } from '@/lib/i18n';
import { DESTAQUE, useCores } from '@/lib/tema';

const abrir = (url: string) => Linking.openURL(url).catch(() => {});

// Detalhe de um filme ou de uma série (a série é convertida para a forma de filme)
export default function Titulo() {
  const { media, id } = useLocalSearchParams<{ media: string; id: string }>();
  const tv = media === 'tv';
  const c = useCores();
  const { width, height } = useWindowDimensions();
  const topo = useSafeAreaInsets().top;
  const { data, erro, repetir } = useTmdb(`/${tv ? 'tv' : 'movie'}/${id}`, {
    append_to_response: tv
      ? 'videos,images,reviews,aggregate_credits,similar,recommendations,keywords,content_ratings,watch/providers,external_ids'
      : 'videos,images,reviews,credits,similar,recommendations,keywords,watch/providers,release_dates',
    include_image_language: `null,${lingua}`,
    include_video_language: `${lingua},en`, // trailers, clips e bastidores também em inglês
  });
  if (erro) return <Aviso repetir={repetir} />;
  if (!data) return <Carregar />;

  const f = tv ? serieComoFilme(data) : data;
  const m = tv ? 'tv' : 'movie';
  const idade = classificacao(f, regiao);
  // cada pessoa aparece uma só vez, com os cargos (ou papéis) todos juntos
  const actores = agruparEquipa(f.credits.cast, 'character');
  const tecnicos = agruparEquipa(f.credits.crew);
  // destaque por baixo da sinopse: quem realiza, cria, produz ou escreve
  const PRINCIPAIS = ['Director', 'Creator', 'Producer', 'Writer'];
  const equipa = tecnicos
    .map((p) => ({ ...p, job: p.job.split(', ').filter((j: string) => PRINCIPAIS.includes(j)).join(', ') }))
    .filter((p) => p.job)
    .slice(0, 4);
  const videos = f.videos.results.filter((v: any) => v.site === 'YouTube');
  const onde = f['watch/providers']?.results?.[regiao];
  const grupos = ([['flatrate', 'streaming'], ['rent', 'alugar'], ['buy', 'comprar']] as const).filter(([k]) => onde?.[k]?.length);
  const elenco = { pathname: '/elenco/[media]/[id]', params: { media: m, id } } as const;

  return (
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* o cabeçalho é transparente (ver _layout): a imagem sobe até ao topo e o botão de voltar fica por cima dela */}
      <Stack.Screen options={{ headerTintColor: f.backdrop_path ? '#fff' : c.texto }} />
      {f.backdrop_path ? (
        <Image source={img(f.backdrop_path, 'w780')} style={{ width, height: Math.round(Math.min((width * 9) / 16, height * 0.55)) + topo }} contentFit="cover" transition={200} />
      ) : (
        <View style={{ height: topo + 56 }} />
      )}
      <View style={{ flexDirection: 'row', gap: 14, padding: 16 }}>
        {f.poster_path && <Image source={img(f.poster_path)} style={{ width: 110, aspectRatio: 2 / 3, borderRadius: 10, backgroundColor: c.superficie }} />}
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: DESTAQUE, fontSize: 12, fontWeight: '700' }}>{t(tv ? 'home.tv' : 'home.filme').toUpperCase()}</Text>
          <Texto accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700' }}>{f.title}</Texto>
          {f.original_title !== f.title && <Texto mudo>{f.original_title}</Texto>}
          <Texto mudo style={{ fontSize: 13 }}>{[f.release_date, f.status, idade].filter(Boolean).join(' · ')}</Texto>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Nota valor={`${Number(f.vote_average).toFixed(1)}/10`} cor={c.texto} tamanho={15} />
            <Texto mudo>({f.vote_count})</Texto>
          </View>
        </View>
      </View>
      {!!f.overview && <Texto style={{ paddingHorizontal: 16, lineHeight: 21 }}>{f.overview}</Texto>}
      <View style={{ marginTop: 14 }}>
        <Etiquetas>
          {f.genres.map((g: any) => (
            <Etiqueta key={g.id} href={{ pathname: '/descobrir', params: { tipo: 'genero', id: g.id, media: m, nome: g.name } }}>{g.name}</Etiqueta>
          ))}
          {f.imdb_id && (
            <Externo url={`https://www.imdb.com/title/${f.imdb_id}`}>IMDb</Externo>
          )}
        </Etiquetas>
      </View>
      {equipa.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingHorizontal: 16, marginTop: 16 }}>
          {equipa.map((p: any) => (
            <View key={p.id}>
              <Texto style={{ fontWeight: '600' }}>{p.name}</Texto>
              <Texto mudo style={{ fontSize: 12 }}>{p.job}</Texto>
            </View>
          ))}
        </View>
      )}

      {videos.length > 0 && (
        <Seccao titulo="Trailers">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {videos.map((v: any) => (
              // shortcut: abre na app/site do YouTube em vez de tocar dentro da app; trocar por um player embutido se for preciso
              <Pressable key={v.id} accessibilityRole="link" accessibilityLabel={`${v.type} - ${v.name}`} onPress={() => abrir(`https://www.youtube.com/watch?v=${v.key}`)} style={{ width: 220, gap: 4 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={`https://img.youtube.com/vi/${v.key}/hqdefault.jpg`} style={{ width: 220, aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: c.superficie }} contentFit="cover" />
                  <View style={{ position: 'absolute' }}>
                    <PlayCircleIcon size={44} color="#fff" />
                  </View>
                </View>
                <Texto mudo numberOfLines={1} style={{ fontSize: 12 }}>{v.type} · {v.name}</Texto>
              </Pressable>
            ))}
          </ScrollView>
        </Seccao>
      )}

      {grupos.length > 0 && (
        <Seccao titulo={`${t('ui.onde_assistir')} (${regiao})`}>
          {grupos.map(([k, rotulo]) => (
            <View key={k} style={{ gap: 6 }}>
              <Texto mudo style={{ paddingHorizontal: 16, fontSize: 13 }}>{t('ui.' + rotulo)}</Texto>
              <Logos itens={onde[k]} />
            </View>
          ))}
          <View style={{ paddingHorizontal: 16 }}>
            <Externo mudo url={onde.link}>{t('ui.dados_justwatch')}</Externo>
          </View>
        </Seccao>
      )}

      {tv && <Temporadas serieId={f.id} temporadas={f.seasons || []} />}

      <Fila titulo={t('ui.elenco')} media="person" itens={actores.slice(0, 12)} legenda={(p) => p.character} verMais={elenco} />
      <Fila titulo={t('ui.equipa_tecnica')} media="person" itens={tecnicos.slice(0, 12)} legenda={(p) => p.job} verMais={elenco} />

      <Galeria imagens={f.images.backdrops} />

      {f.belongs_to_collection && (
        <Seccao titulo={t('ui.coleccao')}>
          <Etiquetas>
            <Etiqueta href={{ pathname: '/descobrir', params: { tipo: 'coleccao', id: f.belongs_to_collection.id, nome: f.belongs_to_collection.name } }}>
              {f.belongs_to_collection.name}
            </Etiqueta>
          </Etiquetas>
        </Seccao>
      )}

      {f.keywords.keywords.length > 0 && (
        <Seccao titulo={t('ui.palavras_chave')}>
          <Etiquetas>
            {f.keywords.keywords.slice(0, 18).map((k: any) => (
              <Etiqueta key={k.id} href={{ pathname: '/descobrir', params: { tipo: 'keyword', id: k.id, nome: k.name } }}>{k.name}</Etiqueta>
            ))}
          </Etiquetas>
        </Seccao>
      )}

      {f.production_companies.length + (f.networks?.length || 0) + f.production_countries.length > 0 && (
        <Seccao titulo={t('ui.produtoras')}>
          <Etiquetas>
            {(f.networks || []).map((n: any) => (
              <Etiqueta key={'c' + n.id} href={{ pathname: '/descobrir', params: { tipo: 'canal', id: n.id, media: 'tv', nome: n.name } }}>{n.name}</Etiqueta>
            ))}
            {f.production_companies.slice(0, 6).map((p: any) => (
              <Etiqueta key={p.id} href={{ pathname: '/descobrir', params: { tipo: 'produtora', id: p.id, nome: p.name } }}>{p.name}</Etiqueta>
            ))}
            {f.production_countries.map((p: any) => (
              <Etiqueta key={p.iso_3166_1} href={{ pathname: '/descobrir', params: { tipo: 'pais', id: p.iso_3166_1, nome: p.name } }}>{p.name}</Etiqueta>
            ))}
          </Etiquetas>
        </Seccao>
      )}

      <Fila titulo={t(tv ? 'ui.series_similares' : 'ui.filmes_similares')} media={m} itens={f.similar.results} />

      {f.reviews.results.length > 0 && (
        <Seccao titulo={t('ui.avaliacoes')}>
          {f.reviews.results.slice(0, 6).map((r: any) => (
            <View key={r.id} style={{ marginHorizontal: 16, padding: 14, borderRadius: 12, backgroundColor: c.superficie, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Texto style={{ fontWeight: '600', flexShrink: 1 }}>{r.author}</Texto>
                <Nota valor={r.author_details?.rating} />
              </View>
              <Texto mudo style={{ fontSize: 12 }}>{new Date(r.updated_at).toLocaleDateString(idioma)}</Texto>
              <Texto style={{ fontSize: 13, lineHeight: 19 }}>{limita(r.content, 410)}</Texto>
              <Externo url={r.url}>{t('ui.ler_mais')}</Externo>
            </View>
          ))}
        </Seccao>
      )}

      <Fila titulo={t(tv ? 'ui.series_recomendadas' : 'ui.filmes_recomendados')} media={m} itens={f.recommendations.results} />
    </ScrollView>
  );
}
