/// <reference types="vite/client" />

// Biến môi trường dùng trong code. Phải bắt đầu bằng VITE_ thì Vite mới đưa ra trình duyệt.
interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
