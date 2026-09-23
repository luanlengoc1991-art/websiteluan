# Alpha Hub — mã nguồn Next.js

Website bất động sản có danh mục dự án, quỹ căn, bộ lọc, màn hình từng dự án, thư viện, quản lý khách hàng và giữ chỗ.

**Đây là ứng dụng Next.js App Router thực sự** (React + TypeScript + Tailwind CSS), chạy bằng `next dev`, `next build`, `next start`. Được chuyển từ bản Alpha Hub trên ChatGPT Sites, bao gồm các sửa lỗi điều hướng mới nhất.

## Chạy trên Windows

1. Cài **Node.js 24 LTS**: https://nodejs.org/ (chọn Windows Installer).
2. Trong GitHub Desktop, chọn repository `websiteluan` → **Fetch origin** → **Pull origin**. Nếu chưa clone: File → Clone repository → URL → `https://github.com/luanlengoc1991-art/websiteluan`.
3. Chọn **Repository → Open in Terminal**. Nếu dùng **Show in Explorer**, mở Terminal trong thư mục chứa `package.json`.
4. Chạy lần lượt:

```powershell
npm ci
npm run setup
npm run dev
```

`setup` hỏi email, tạo mật khẩu ngẫu nhiên và hiển thị một lần để bạn lưu. Không chạy lại setup khi đã có `.env.local`. Vào http://localhost:3000 để xem website; http://localhost:3000/dang-nhap để đăng nhập quản trị.

Dừng bằng **Ctrl + C**. Những lần sau chỉ cần `npm run dev`.

## Dùng ChatGPT/Codex trên máy tính với API key

1. Clone repo này bằng GitHub Desktop.
2. Trong công cụ ChatGPT/Codex trên máy, mở đúng thư mục `websiteluan` vừa clone.
3. Cấu hình API key trong cài đặt của công cụ AI; không dán key vào code hoặc commit lên GitHub.
4. Gửi yêu cầu, ví dụ: **“Đọc AGENTS.md và README.md. Sửa trang danh sách dự án trong repo này, kiểm tra build trước khi kết thúc.”**
5. Xem phần thay đổi trong GitHub Desktop, Commit rồi Push origin.

API key xác thực dịch vụ AI. Quyền đọc/ghi GitHub dùng tài khoản GitHub đăng nhập trong GitHub Desktop hoặc công cụ Git; hai loại quyền này khác nhau.

## Sửa code và đồng bộ hai máy

- Trước khi sửa: **Fetch origin → Pull origin**.
- Mở thư mục repo bằng VS Code/Codex trên máy. Yêu cầu AI chỉnh các file tại đây.
- Kiểm tra bằng `npm run dev`.
- Sau khi sửa: GitHub Desktop → nhập nội dung thay đổi → **Commit to main → Push origin**.
- Sang máy khác: Pull origin, `npm ci` nếu dependencies thay đổi, rồi `npm run dev`.
- `.env.local` và thư mục `data/` không được đưa lên GitHub. Mỗi máy có tài khoản và dữ liệu local riêng. Git chỉ đồng bộ mã nguồn.

**Repo này và website `chatgpt.site` chưa có đồng bộ triển khai hai chiều.** Sửa code trên GitHub không tự cập nhật website ChatGPT đang chạy. Bản trên GitHub là phiên bản Next.js độc lập để tiếp tục phát triển/triển khai.

## Chức năng đã có

- 14 dự án, 112 căn minh họa; danh sách, tìm kiếm, bộ lọc và phân trang.
- Mỗi dự án có URL riêng: tổng quan, 360°, vị trí, phân khu, nhà mẫu, tiện ích, mặt bằng, bảng hàng, thư viện, tài liệu.
- Yêu thích, so sánh căn, xuất CSV, nhập CSV, chỉnh dự án/căn/bài viết.
- Khách hàng, giữ chỗ có thời hạn, gia hạn, hủy và ghi nhận bán. Đây là ghi nhận nội bộ, không thanh toán hay booking với chủ đầu tư.
- Đăng nhập quản trị bằng mật khẩu băm scrypt; session phía máy chủ, cookie HttpOnly và giới hạn thử đăng nhập.
- SQLite lưu dữ liệu thật tại `data/alpha-hub.sqlite`; file tải lên nằm trong `data/uploads/` và được kiểm tra đăng nhập khi tải xuống.

Tài khoản quản trị có toàn quyền. Chưa có đăng ký công khai, nhiều nhân viên hay phân quyền vai trò. Dữ liệu quản trị hiện chỉ hiển thị trong phiên đăng nhập; khách công khai xem danh mục mẫu. Không có dữ liệu khách hàng/file riêng từ ChatGPT Sites được chuyển sang repo.

## File cần biết

| Đường dẫn | Nội dung |
|---|---|
| `app/[[...slug]]/page.tsx` | Điểm vào các trang |
| `components/hub.tsx` | Giao diện và luồng nghiệp vụ chính |
| `components/project-workspace.tsx` | Không gian bên trong từng dự án |
| `app/globals.css` | Màu sắc và giao diện |
| `lib/catalog.ts` | Dự án/căn/bài viết minh họa |
| `lib/project-routes.ts` | Đường dẫn dự án |
| `app/api/` | API dữ liệu, đăng nhập, upload |
| `db/store.ts` | SQLite và lưu file trên ổ đĩa |
| `public/alpha-hub-logo.png` | Logo gốc |

## Build và kiểm thử

```powershell
npm run typecheck
npm run build
npm test
npm start
```

`npm test` chạy kiểm thử HTTP với database/file tạm riêng, không sửa `data/` thật. Cần build trước. Bản build và kiểm thử đã được chạy trong môi trường Linux/Node 24; chưa trực tiếp kiểm thử trên Windows.

## Đưa lên mạng chạy thực tế

Bản này phù hợp **máy chủ Node.js 24/VPS hoặc Docker có ổ đĩa lưu bền vững**. Đặt HTTPS bằng reverse proxy, chạy một instance và sao lưu `data/` (gồm file SQLite, WAL và uploads; dừng ứng dụng trước khi sao lưu toàn bộ thư mục).

```sh
npm ci
npm run setup
npm run build
npm start
```

Khi dùng HTTPS production, đặt `ALPHA_SECURE_COOKIE=true`. Nếu dùng Docker: `docker compose up --build -d` sau khi tạo `.env.local`. Docker lưu dữ liệu vào `./data` trên máy chủ. Trên Linux, cấp quyền ghi cho user container trước khi chạy: `sudo chown -R 1000:1000 data`. Chỉ công khai qua reverse proxy HTTPS; cổng Docker mặc định bind localhost.

**Không đưa nguyên bản SQLite/ổ đĩa local này lên Vercel để lưu dữ liệu lâu dài.** Nếu muốn dùng Vercel, cần đổi `db/store.ts` và phần xác thực sang dịch vụ dữ liệu/file dùng chung (ví dụ Postgres + object storage), rồi kiểm thử lại. Không có kết nối Supabase/Vercel nào được tạo trong lần xuất mã nguồn này.

## Dữ liệu và tài sản

Giá, căn và trạng thái hiện là mẫu, không phải bảng hàng chính thức. Không đồng bộ dữ liệu VHub. Ảnh dự án còn tham chiếu URL công khai ngoài repo; cần thay bằng ảnh bạn có quyền sử dụng và lưu trữ trước khi vận hành thương mại. Ảnh panorama/mặt bằng/tài liệu phải tải lên riêng từng dự án; chưa có dữ liệu tour thực tế được sao chép.

Nguồn kỹ thuật: https://nextjs.org/docs/app/getting-started/deploying và https://nodejs.org/api/sqlite.html.
