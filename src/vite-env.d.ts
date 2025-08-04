/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JWT_SECRET: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 