// Backend giả. shared/lib/api.ts gọi handleMock() khi VITE_USE_MOCK=true.
// Hiện chưa có route giả nào: mỗi nghiệp vụ sẽ tự thêm route của mình vào đây (kèm dữ liệu mẫu).
// Route giả phải ném ApiError(status, code) giống hệt backend thật sẽ làm (xem docs/API_CONTRACT.md).

import { ApiError } from "@/shared/lib/api";
import type { HttpMethod } from "@/shared/lib/api";

export async function handleMock(method: HttpMethod, path: string, _body?: unknown): Promise<unknown> {
  throw new ApiError(404, "NOT_FOUND", `No mock route for ${method} ${path}`);
}
