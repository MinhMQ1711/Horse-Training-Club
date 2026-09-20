import { redirect } from "next/navigation";

// "/" chưa có nội dung riêng: đưa về trang đăng nhập (đã đăng nhập thì Login tự chuyển vào app).
export default function HomePage() {
  redirect("/login");
}
