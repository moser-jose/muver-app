import { MagnifierIcon } from '@solar-icons/react-native/linear/magnifier';
import { useEffect, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { Aviso, Carregar, Etiqueta, Etiquetas, Seccao, Texto, TituloAba } from '@/components/base';
import { Fila, hrefLista } from '@/components/cartoes';
import { useTmdb } from '@/lib/api';
import { t } from '@/lib/i18n';
import { useCores } from '@/lib/tema';

// colecções, produtoras e palavras-chave com o termo pesquisado: [pedido, tipo no /descobrir, rótulo]
const EXTRAS = [['collection', 'coleccao', 'coleccoes'], ['company', 'produtora', 'produtoras'], ['keyword', 'keyword', 'palavras_chave']] as const;

export default function Pesquisa() {
  const c = useCores();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  // pesquisa enquanto se escreve, depois de uma pausa para não fazer um pedido por letra
  useEffect(() => {
    const espera = setTimeout(() => setQ(texto.trim()), 400);
    return () => clearTimeout(espera);
  }, [texto]);

  const pedir = (tipo: string) => [q ? `/search/${tipo}` : null, { query: q }] as const;
  const filmes = useTmdb(...pedir('movie'));
  const series = useTmdb(...pedir('tv'));
  const pessoas = useTmdb(...pedir('person'));
  const extras = [useTmdb(...pedir('collection')), useTmdb(...pedir('company')), useTmdb(...pedir('keyword'))];

  const principais = [filmes, series, pessoas];
  const pronto = principais.every((r) => r.data || r.erro);
  const falhou = principais.every((r) => r.erro);
  const vazio = pronto && ![...principais, ...extras].some((r) => r.data?.results.length);
  const total = (r: typeof filmes, nome: string) => `${r.data?.total_results ?? ''} ${nome}`.trim();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 120 }}>
      <TituloAba>{t('header.pesquisa')}</TituloAba>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        onSubmitEditing={() => setQ(texto.trim())}
        placeholder={t('header.pesquisar')}
        placeholderTextColor={c.mudo}
        accessibilityLabel={t('header.pesquisar')}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
        style={{ marginHorizontal: 16, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: c.borda, backgroundColor: c.superficie, color: c.texto, fontSize: 16 }}
      />
      {!q ? (
        // ainda sem pesquisa: explica o que fazer
        <View style={{ alignItems: 'center', gap: 10, paddingHorizontal: 40, paddingTop: 56 }}>
          <MagnifierIcon size={56} color={c.mudo} />
          <Texto style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{t('ui.pesquisa_titulo')}</Texto>
          <Texto mudo style={{ textAlign: 'center', lineHeight: 20 }}>{t('ui.pesquisa_dica')}</Texto>
        </View>
      ) : !pronto ? (
        <Carregar />
      ) : falhou ? (
        <Aviso repetir={() => [...principais, ...extras].forEach((r) => r.repetir())} />
      ) : vazio ? (
        <Texto mudo style={{ textAlign: 'center', padding: 32 }}>{t('ui.nenhum')}</Texto>
      ) : (
        <>
          <Fila titulo={total(filmes, t('ui.n_filmes'))} media="movie" itens={filmes.data?.results} verMais={hrefLista('/search/movie', { query: q }, `${t('ui.filmes')} · ${q}`, 'movie')} />
          <Fila titulo={total(series, t('ui.n_series'))} media="tv" itens={series.data?.results} verMais={hrefLista('/search/tv', { query: q }, `${t('header.series')} · ${q}`, 'tv')} />
          <Fila titulo={t('ui.pessoas')} media="person" itens={pessoas.data?.results} verMais={hrefLista('/search/person', { query: q }, `${t('ui.pessoas')} · ${q}`, 'person')} />
          {EXTRAS.map(([, tipo, rotulo], i) => {
            const itens: any[] = extras[i].data?.results.slice(0, 8) ?? [];
            return (
              itens.length > 0 && (
                <Seccao key={tipo} titulo={t('ui.' + rotulo)}>
                  <Etiquetas>
                    {itens.map((x) => (
                      <Etiqueta key={x.id} href={{ pathname: '/descobrir', params: { tipo, id: x.id, nome: x.name } }}>{x.name}</Etiqueta>
                    ))}
                  </Etiquetas>
                </Seccao>
              )
            );
          })}
        </>
      )}
    </ScrollView>
  );
}
