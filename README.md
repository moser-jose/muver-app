# Muver (app)

App móvel do [Muver](https://muver.moserjose.com/) em React Native + Expo (SDK 58, Expo Router), com os dados da [TMDB](https://www.themoviedb.org/).

## Correr

1. `npm install`
2. Copie `.env.example` para `.env.local` e ponha a chave da TMDB em `EXPO_PUBLIC_TMDB_KEY`
3. `npx expo run:ios` (ou `npx expo run:android`) para compilar e instalar a development build — só é preciso repetir quando mudam dependências nativas ou o `app.json`
4. No dia-a-dia, `npx expo start` e abra a app Muver instalada (a development build)

As pastas `ios/` e `android/` são geradas pelo Expo a partir do `app.json` e não vão para o git.

`npm test` corre os testes (Jest): dados, traduções, tema, pedidos à TMDB e os ecrãs de Pesquisa e Definições; `npm run typecheck` verifica os tipos.

## Estrutura

- `src/app` — ecrãs (abas Muver, Filmes, Séries, Pesquisa, Definições; detalhe de título e pessoa; actores; elenco; listas; descobrir)
- `src/components` — cartões, filas, grelha, temporadas
- `src/lib` — pedidos à TMDB, traduções (pt/en, segue o idioma do telemóvel), tema

Este produto usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
