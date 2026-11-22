import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { img, useTmdb } from '@/lib/api';
import { t } from '@/lib/i18n';
import { useCores } from '@/lib/tema';

import { Carregar, Chips, Nota, Seccao, Texto } from './base';

// Temporadas de uma série; os episódios só são pedidos quando a temporada é escolhida
export function Temporadas({ serieId, temporadas }: { serieId: number; temporadas: any[] }) {
  const c = useCores();
  const lista = temporadas.filter((s) => s.episode_count > 0);
  const [numero, setNumero] = useState<string>(String((lista.find((s) => s.season_number > 0) || lista[0])?.season_number));
  const { data, erro } = useTmdb(lista.length ? `/tv/${serieId}/season/${numero}` : null);
  if (!lista.length) return null;
  const episodios: any[] | undefined = erro ? [] : data?.episodes;
  return (
    <Seccao titulo={t('ui.temporadas')}>
      <Chips opcoes={lista.map((s) => [String(s.season_number), `${s.name} · ${s.episode_count}`])} valor={numero} onChange={setNumero} />
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        {!episodios ? (
          <Carregar />
        ) : !episodios.length ? (
          <Texto mudo>{t('ui.sem_episodios')}</Texto>
        ) : (
          episodios.map((e) => (
            <View key={e.id} style={{ flexDirection: 'row', gap: 12 }}>
              {e.still_path && <Image source={img(e.still_path, 'w300')} style={{ width: 120, aspectRatio: 16 / 9, borderRadius: 8, backgroundColor: c.superficie }} />}
              <View style={{ flex: 1, gap: 2 }}>
                <Texto style={{ fontWeight: '600' }}>{e.episode_number}. {e.name}</Texto>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Texto mudo style={{ fontSize: 12 }}>{[e.air_date, e.runtime && `${e.runtime} min`].filter(Boolean).join(' · ')}</Texto>
                  <Nota valor={e.vote_average} />
                </View>
                {!!e.overview && <Texto mudo numberOfLines={3} style={{ fontSize: 13 }}>{e.overview}</Texto>}
              </View>
            </View>
          ))
        )}
      </View>
    </Seccao>
  );
}
