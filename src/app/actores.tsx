import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Chips } from '@/components/base';
import { Grelha } from '@/components/cartoes';
import { usePaginas } from '@/lib/api';
import { periodos, t } from '@/lib/i18n';

export default function Actores() {
  const [periodo, setPeriodo] = useState<'day' | 'week'>('day');
  const lista = usePaginas(`/trending/person/${periodo}`);
  return (
    <Grelha
      {...lista}
      media="person"
      onFim={lista.mais}
     
      cabecalho={
        <View style={{ paddingTop: 12 }}>
          <Stack.Screen options={{ title: t('header.actores') }} />
          <Chips opcoes={periodos()} valor={periodo} onChange={setPeriodo} />
        </View>
      }
    />
  );
}
