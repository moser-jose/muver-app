import { Image } from 'expo-image';
import { Href, Link } from 'expo-router';
import { ReactElement } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { img, useTmdb } from '@/lib/api';
import { ano } from '@/lib/dados';
import { regiao, t } from '@/lib/i18n';
import { DESTAQUE, useCores } from '@/lib/tema';

import { Aviso, Nota, Seccao, Texto } from './base';

export type Media = 'movie' | 'tv' | 'person';
type Params = Record<string, string | number | undefined>;

const SEM_CARTAZ = require('@/assets/images/poster.jpg');
const SEM_FOTO = require('@/assets/images/user-act.jpg');
const SEM_FOTO_F = require('@/assets/images/user-act-f.jpg');

export const hrefDe = (item: any, media: Media): Href =>
  media === 'person' ? { pathname: '/pessoa/[id]', params: { id: item.id } } : { pathname: '/titulo/[media]/[id]', params: { media, id: item.id } };

export const hrefLista = (path: string, params: Params, titulo: string, media: Media): Href => ({
  pathname: '/lista',
  params: { path, params: JSON.stringify(params), titulo, media },
});

// Cartaz de filme/série ou foto de pessoa; sem `media` usa o `media_type` de cada item (listas mistas)
export function Cartao({ item, media, largura, legenda }: { item: any; media?: Media; largura: number; legenda?: string }) {
  const c = useCores();
  const m: Media = media ?? item.media_type;
  const pessoa = m === 'person';
  const caminho = pessoa ? item.profile_path : item.poster_path;
  return (
    <Link href={hrefDe(item, m)} asChild>
      <Pressable style={{ width: largura, gap: 4 }}>
        <Image
          source={caminho ? img(caminho) : pessoa ? (item.gender === 1 ? SEM_FOTO_F : SEM_FOTO) : SEM_CARTAZ}
          style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 10, backgroundColor: c.superficie }}
          contentFit="cover"
          transition={150}
        />
        <Texto numberOfLines={1} style={{ fontSize: 13, fontWeight: '600' }}>{item.title || item.name}</Texto>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Texto mudo numberOfLines={legenda ? 2 : 1} style={{ fontSize: 12, flexShrink: 1 }}>{legenda ?? (pessoa ? '' : ano(item))}</Texto>
          {legenda === undefined && !pessoa && <Nota valor={item.vote_average} />}
        </View>
      </Pressable>
    </Link>
  );
}

// Fila horizontal: ou pede a lista à TMDB (`path`) ou recebe os `itens` já prontos
export function Fila(p: { titulo: string; media?: Media; path?: string; params?: Params; itens?: any[]; verMais?: Href; filtro?: (x: any) => boolean; legenda?: (x: any) => string}) {
  const { data } = useTmdb(p.path ?? null, p.params);
  let itens: any[] = p.itens ?? data?.results ?? [];
  if (p.filtro) itens = itens.filter(p.filtro);
  if (!itens.length) return null; // sem dados (ou pedido falhado) a fila fica escondida
  const verMais = p.verMais ?? (p.path && p.media ? hrefLista(p.path, p.params ?? {}, p.titulo, p.media) : undefined);
  return (
    <Seccao titulo={p.titulo} verMais={verMais}>
      <FlatList
        horizontal
        data={itens}
        keyExtractor={(x, i) => `${x.id}-${i}`}
        renderItem={({ item }) => <Cartao item={item} media={p.media} largura={118} legenda={p.legenda?.(item)} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
        initialNumToRender={5}
      />
    </Seccao>
  );
}

// Grelha vertical de 3 colunas com scroll infinito
// Grelha vertical de 3 colunas; ao chegar perto do fim chama `onFim` e mostra um spinner enquanto vêm mais itens
export function Grelha(p: { itens: any[]; media?: Media; cabecalho?: ReactElement; aCarregar?: boolean; erro?: boolean; repetir?: () => void; onFim?: () => void; legenda?: (x: any) => string }) {
  const { width } = useWindowDimensions();
  // 3 colunas num telemóvel normal; mais em ecrãs largos (iPhone Duo aberto, tablets, paisagem), com cartazes de ~125 pt
  const colunas = Math.max(3, Math.floor((width - 16 * 2 + 10) / 125));
  const largura = (width - 16 * 2 - 10 * (colunas - 1)) / colunas;
  return (
    <FlatList
      data={p.itens}
      key={colunas} // a FlatList não aceita mudar o número de colunas (ao abrir/fechar o Duo ou rodar) sem ser recriada
      numColumns={colunas}
      keyExtractor={(x, i) => `${x.id}-${i}`}
      renderItem={({ item }) => <Cartao item={item} media={p.media} largura={largura} legenda={p.legenda?.(item)} />}
      columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 14, paddingBottom: 120 }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={p.cabecalho}
      ListEmptyComponent={p.aCarregar || p.erro ? undefined : <Texto mudo style={{ textAlign: 'center', padding: 32 }}>{t('ui.nenhum')}</Texto>}
      ListFooterComponent={p.erro ? <Aviso repetir={p.repetir} /> : p.aCarregar ? <ActivityIndicator size="large" color={DESTAQUE} accessibilityLabel={t('home.carregar')} style={{ padding: 28 }} /> : undefined}
      onEndReached={p.onFim}
      onEndReachedThreshold={0.6}
    />
  );
}

// Destaque do topo: imagens grandes que passam para o lado; `ateAoTopo` estende a imagem por baixo da barra de estado
export function Destaque({ path, params, media, ateAoTopo }: { path: string; params?: Params; media?: Media; ateAoTopo?: boolean }) {
  const { data } = useTmdb(path, params);
  const { width, height } = useWindowDimensions();
  const topo = useSafeAreaInsets().top;
  // em ecrãs largos ou em paisagem a imagem não passa de 55% da altura, para o resto do ecrã continuar à vista
  const altura = Math.round(Math.min(width * 0.62, height * 0.55)) + (ateAoTopo ? topo : 0);
  const itens = (data?.results ?? []).filter((x: any) => x.backdrop_path && (media || x.media_type === 'movie' || x.media_type === 'tv')).slice(0, 10);
  return (
    <FlatList
      key={width} // recomeça alinhado quando a largura muda (abrir/fechar o Duo, rodar)
      horizontal
      pagingEnabled
      data={itens}
      style={{ height: altura, flexGrow: 0 }}
      keyExtractor={(x) => String(x.id)}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => {
        const m: Media = media ?? item.media_type;
        return (
          <Link href={hrefDe(item, m)} asChild>
            <Pressable style={{ width, height: altura, justifyContent: 'flex-end' }}>
              <Image source={img(item.backdrop_path, 'w780')} style={{ position: 'absolute', width, height: altura }} contentFit="cover" transition={200} />
              <View style={{ backgroundColor: 'rgba(10,10,11,0.6)', padding: 16, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: DESTAQUE, fontSize: 12, fontWeight: '700' }}>{t(m === 'tv' ? 'home.tv' : 'home.filme').toUpperCase()}</Text>
                  <Nota valor={item.vote_average} cor="#fff" />
                </View>
                <Text numberOfLines={1} style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{item.title || item.name}</Text>
                {!!item.overview && <Text numberOfLines={2} style={{ color: '#ddd', fontSize: 13 }}>{item.overview}</Text>}
              </View>
            </Pressable>
          </Link>
        );
      }}
    />
  );
}

// Logótipos de serviços de streaming; cada um abre o catálogo desse serviço
export function Logos({ itens }: { itens: any[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
      {itens.map((p) => (
        <Link key={p.provider_id} href={{ pathname: '/descobrir', params: { tipo: 'provedor', id: p.provider_id, nome: p.provider_name } }} asChild>
          <Pressable accessibilityLabel={p.provider_name}>
            <Image source={img(p.logo_path, 'w92')} style={{ width: 52, height: 52, borderRadius: 12 }} />
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

export function Provedores() {
  const { data } = useTmdb('/watch/providers/movie', { watch_region: regiao });
  if (!data?.results.length) return null;
  const prioridade = (p: any) => p.display_priorities?.[regiao] ?? 999;
  const itens = [...data.results].sort((a, b) => prioridade(a) - prioridade(b)).slice(0, 14);
  return (
    <Seccao titulo={t('ui.por_streaming')}>
      <Logos itens={itens} />
    </Seccao>
  );
}
