# Alpha Hub — Next.js + Supabase

Website bất động sản có danh mục dự án, quỹ căn, bộ lọc, các trang dự án, quản lý khách hàng, giữ chỗ và thư viện file. Mã nguồn Next.js App Router này được triển khai từ GitHub lên Vercel.

## Chạy trên Windows

1. Cài Node.js 24, clone `https://github.com/luanlengoc1991-art/websiteluan` bằng GitHub Desktop rồi mở thư mục có `package.json`.
2. Tạo `.env.local` từ `.env.example`, điền URL và publishable key của Supabase project đã liên kết. Đây là key công khai; tuyệt đối không dùng secret/service role key trong biến `NEXT_PUBLIC_`.
3. Chạy `npm ci` và `npm run dev`, mở `http://localhost:3000`.

Tài khoản đăng nhập được tạo trong **Supabase → Authentication → Users → Add user**. Mật khẩu cũ của bản SQLite không tự chuyển sang Supabase. Không commit `.env.local` hoặc dữ liệu khách hàng lên GitHub.

## Cấu hình Vercel

Trong project Vercel `websiteluan`, đặt hai biến môi trường cho **Production**, **Preview** và **Development**:

| Tên biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL từ Supabase Connect |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key `sb_publishable_…` từ Supabase API Keys |

Redeploy sau khi đặt biến. Từ lần tiếp theo, push code lên nhánh được Vercel theo dõi sẽ kích hoạt build tự động nếu liên kết GitHub của Vercel vẫn hoạt động. Mỗi máy Windows cần `.env.local` riêng hoặc dùng `vercel env pull .env.local`; file này không đồng bộ qua GitHub.

## Dữ liệu và quyền truy cập

Backend dùng Supabase Auth, ba bảng `alpha_records`, `alpha_reservations`, `alpha_files` và bucket riêng tư `alpha-hub-files`. Migration ở `supabase/migrations/`; đã bật RLS theo người dùng. Mỗi người đăng nhập chỉ thấy dữ liệu và file của tài khoản mình. Endpoint tải file kiểm tra phiên đăng nhập trước khi trả nội dung.

Các bảng CRM khác trong cùng Supabase project không bị sửa. Dữ liệu từng lưu trong `data/alpha-hub.sqlite` trên máy cũ **không tự di chuyển**; cần xuất và nhập dữ liệu riêng nếu bạn đã dùng bản local. Danh mục dự án và căn mặc định chỉ là dữ liệu minh họa.

## Kiểm tra

```sh
npm run typecheck
npm run build
npm test
```

`npm test` kiểm tra các trang công khai và rằng người chưa đăng nhập không thể gọi API lưu dữ liệu hoặc tải file. Muốn thử lưu dữ liệu thật cần tạo người dùng Supabase và đăng nhập trong trình duyệt.

## Chỉnh sửa trên hai máy

Trong GitHub Desktop: **Fetch origin → Pull origin** trước khi làm; sửa và kiểm tra trên máy; **Commit → Push origin** sau khi làm. Sang máy kia, Pull origin rồi `npm ci` nếu dependencies thay đổi. API key ChatGPT dùng cho công cụ AI, không thay cho quyền GitHub hoặc biến cấu hình Supabase.

Website trên `chatgpt.site` là một bản riêng và không tự đồng bộ từ repo này.
