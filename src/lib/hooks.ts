"use client";

import { useEffect, useState } from "react";

// Đọc query string (?next=...&email=...) SAU khi trang đã hiện ở trình duyệt.
// Trả về null trong lần render đầu (khi server dựng HTML) để tránh lệch giữa server và client.
export function useQueryParams(): URLSearchParams | null {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return params;
}

// Đếm ngược tới mốc `target` (mili-giây). Trả về số ms còn lại, 0 khi đã qua.
export function useCountdown(target: number | null): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (target === null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [target]);
  return target === null ? 0 : Math.max(0, target - now);
}

// Ngày hôm nay, chỉ có giá trị sau khi mount (tránh lệch múi giờ giữa server và client).
export function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);
  return today;
}
