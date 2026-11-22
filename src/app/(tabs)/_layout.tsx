import { NativeTabs } from 'expo-router/native-tabs';

import { t } from '@/lib/i18n';
import { DESTAQUE } from '@/lib/tema';

// As abas nativas só aceitam imagens: estes PNG são os ícones Solar (linear / bold) convertidos de SVG.
// Para trocar um ícone é preciso gerar de novo os PNG em assets/images/tabs (1x, @2x, @3x).
const abas = () => [
  ['index', 'Muver', require('@/assets/images/tabs/inicio.png'), require('@/assets/images/tabs/inicio-on.png')],
  ['filmes', t('header.filme'), require('@/assets/images/tabs/filmes.png'), require('@/assets/images/tabs/filmes-on.png')],
  ['series', t('header.series'), require('@/assets/images/tabs/series.png'), require('@/assets/images/tabs/series-on.png')],
  ['pesquisa', t('header.pesquisa'), require('@/assets/images/tabs/pesquisa.png'), require('@/assets/images/tabs/pesquisa-on.png')],
  ['definicoes', t('ui.definicoes'), require('@/assets/images/tabs/definicoes.png'), require('@/assets/images/tabs/definicoes-on.png')],
] as const;

export default function Abas() {
  return (
    <NativeTabs tintColor={DESTAQUE} labelVisibilityMode="labeled">
      {abas().map(([name, titulo, contorno, cheio], i) => (
        // as três primeiras abas têm a imagem de destaque até ao topo do ecrã: sem isto, a barra de abas
        // nativa empurra o conteúdo para baixo da barra de estado, mesmo que o ecrã peça o contrário
        <NativeTabs.Trigger key={name} name={name} disableAutomaticContentInsets={i < 3}>
          <NativeTabs.Trigger.Label>{titulo}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={{ default: contorno, selected: cheio }} renderingMode="template" />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
