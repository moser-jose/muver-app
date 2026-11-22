import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Aviso, Carregar, Chips } from '@/components/base';
import { Grelha } from '@/components/cartoes';
import { useTmdb } from '@/lib/api';
import { agruparEquipa, serieComoFilme } from '@/lib/dados';
import { t } from '@/lib/i18n';

// Todo o elenco e equipa técnica de um filme ou série
export default function Elenco() {
  const { media, id } = useLocalSearchParams<{ media: string; id: string }>();
  const tv = media === 'tv';
  const [grupo, setGrupo] = useState<'cast' | 'crew'>('cast');
  const { data, erro, repetir } = useTmdb(`/${tv ? 'tv' : 'movie'}/${id}`, { append_to_response: tv ? 'aggregate_credits' : 'credits' });
  if (erro) return <Aviso repetir={repetir} />;
  if (!data) return <Carregar />;
  const f = tv ? serieComoFilme(data) : data;
  return (
    <>
      <Stack.Screen options={{ title: f.title }} />
      <Grelha
        media="person"
        itens={grupo === 'cast' ? agruparEquipa(f.credits.cast, 'character') : agruparEquipa(f.credits.crew)}
        legenda={(p) => (grupo === 'cast' ? p.character : p.job) || ''}
        cabecalho={
          <View style={{ paddingTop: 12 }}>
            <Chips opcoes={[['cast', t('ui.elenco')], ['crew', t('ui.equipa_tecnica')]]} valor={grupo} onChange={setGrupo} />
          </View>
        }
      />
    </>
  );
}
