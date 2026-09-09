/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API base URL. Defaults to "/api" (proxied by the Vite dev server). */
  readonly VITE_API_BASE_URL?: string
  /** Where the dev server proxies /api/* (default: http://localhost:5204). */
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
