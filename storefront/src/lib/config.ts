import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
// let MEDUSA_BACKEND_URL = "http://localhost:9000"

// if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
//   MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
// }

const publicUrl =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// サーバーサイド（Node.js環境）で使われるURL
const privateUrl = process.env.MEDUSA_BACKEND_URL || "http://backend:9000"

// 実行環境に応じてURLを決定
// `typeof window` はブラウザでは "object"、サーバーでは "undefined" になる
const MEDUSA_BACKEND_URL = typeof window !== "undefined" ? publicUrl : privateUrl

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
