import { Stack, useLocalSearchParams } from 'expo-router';

import { Grelha, Media } from '@/components/cartoes';
import { usePaginas } from '@/lib/api';

// "Ver mais" de uma fila: a mesma lista da TMDB, completa
export default function Lista() {
  const p = useLocalSearchParams<{ path: string; params?: string; titulo?: string; media: Media }>();
  let params = {};
  try {
    params = JSON.parse(p.params || '{}');
  } catch {} // link externo com params inválidos: a lista abre sem filtros
  const lista = usePaginas(p.path, params);
  return (
    <>
      <Stack.Screen options={{ title: p.titulo }} />
      <Grelha {...lista} media={p.media} onFim={lista.mais} />
    </>
  );
}
