/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVICE_URL: string
  readonly VITE_JOB_SERVICE_URL: string
  readonly VITE_APPLICATION_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
