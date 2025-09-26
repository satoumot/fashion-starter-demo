import { MeiliSearch } from "meilisearch"

// サーバーサイド（Dockerコンテナ内）で使われるURL
const serverSideEndpoint =
  process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://meilisearch:7700";

// クライアントサイド（ブラウザ）で使われるURL
const clientSideEndpoint = "http://localhost:7700";

// 実行環境に応じてURLを決定する
// `typeof window` はブラウザでは "object"、サーバーでは "undefined" になる
const endpoint =
  typeof window === "undefined" ? serverSideEndpoint : clientSideEndpoint;

const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY || "test_key";

export const searchClient = new MeiliSearch({
  host: endpoint,
  apiKey: apiKey,
});