# project-HT-CNW-Phones-Website
# 🚀 Quy trình làm việc với GitHub trong dự án

## 1️⃣ **Clone dự án về máy**
Nếu bạn chưa có repo trên máy, hãy clone nó về:
```bash
git clone <URL-REPO>  # URL-REPO là đường dẫn của repository trên GitHub. Bạn có thể lấy URL này từ nút 'Code' trên trang GitHub repo.
cd <Tên-Repo>
```

---
## 2️⃣ **Tạo branch mới để làm việc**
Luôn làm việc trên branch riêng thay vì `main`:
```bash
git checkout -b <tên-branch>
```
📌 Bạn có thể đặt tên branch theo tính năng hoặc sửa lỗi, ví dụ:
```bash
git checkout -b feature/login-page
```
```bash
git checkout -b bugfix/fix-header
```

---
## 3️⃣ **Thêm và commit thay đổi**
Sau khi chỉnh sửa code, thêm file vào staging:
```bash
git add .  # Hoặc chỉ add file cụ thể: git add <file> | Dấu chấm là sẽ add hết tất cả file.
```
Commit lại với mô tả rõ ràng:
```bash
git commit -m "Mô tả ngắn gọn về thay đổi"
```

📌 **Cách thoát ghi comment trong commit (khi mở trình soạn thảo Git mặc định như Vim) trong trường hợp không điền tham số -m và mô tả ở đằng sau**:
- Nếu bạn đang ở chế độ chỉnh sửa trong Vim, nhấn `ESC`, sau đó gõ `:wq` rồi nhấn `Enter` để lưu và thoát.
- Nếu muốn thoát mà không lưu, gõ `:q!` rồi nhấn `Enter`.

---
## 4️⃣ **Push code lên GitHub**
Gửi branch của bạn lên repo:
```bash
git push origin <tên-branch>
```
📌 Bạn có thể thay 'origin' bằng tên remote khác nếu repo có nhiều remote, nhưng 'origin' là mặc định.
📌 Ví dụ:
```bash
git push origin feature/login-page
```

---
## 5️⃣ **Tạo Pull Request (PR)**
1. Vào GitHub repo của bạn.
2. Chuyển đến tab `Pull Requests` → Chọn `New Pull Request`.
3. Chọn branch của bạn (`feature/login-page`) và so sánh với `main`.
4. Viết mô tả ngắn gọn về thay đổi → `Create Pull Request`.

---
## 6️⃣ **Review & Merge Code**
- **Nếu bạn là người review**: Kiểm tra code, comment feedback nếu cần.
- **Nếu được duyệt**: Merge vào `main` bằng cách nhấn `Merge Pull Request` trên GitHub.
- **Sau khi merge**: Xóa branch cũ nếu không còn dùng:
  ```bash
  git branch -d <tên-branch>
  git push origin --delete <tên-branch>
  ```
📌 Lệnh `git branch -d <tên-branch>` chỉ xóa branch trên máy cục bộ. Nếu muốn xóa trên GitHub, cần thêm `git push origin --delete <tên-branch>`.

---
## 7️⃣ **Cập nhật code mới nhất**
Trước khi làm việc, luôn cập nhật code từ `main` để đảm bảo bạn có phiên bản mới nhất của dự án:
```bash
git checkout main
git pull origin main
```

📌 **Khi nào cần cập nhật code?**
- Nếu bạn chưa làm việc trong một thời gian và muốn chắc chắn có phiên bản mới nhất.
- Nếu bạn thấy có commit mới trên GitHub mà bạn chưa có trên máy.

📌 **CMD hiển thị khi chạy `git pull origin main`**:
```bash
From github.com:user/repo
 * branch            main       -> FETCH_HEAD
Already up to date.
```
(Nếu không có thay đổi nào mới)

```bash
Updating a1b2c3d..d4e5f6g
Fast-forward
 file1.txt  |  2 +-
 file2.txt  | 10 +++++-----
 2 files changed, 6 insertions(+), 6 deletions(-)
```
(Nếu có thay đổi mới được cập nhật)

Nếu đang làm trên branch khác, hãy merge `main` vào:
```bash
git checkout <tên-branch>
git merge main
```
📌 **Lưu ý**: Nếu có conflict (xung đột), Git sẽ yêu cầu bạn sửa trước khi tiếp tục. Sau khi sửa, commit lại để hoàn tất.

---
## 📌 **Tóm tắt nhanh**
| Hành động | Lệnh |
|-----------|------|
| Clone repo | `git clone <URL-REPO>` |
| Tạo branch mới | `git checkout -b <tên-branch>` |
| Thêm file | `git add .` hoặc `git add <file>` |
| Commit thay đổi | `git commit -m "Mô tả"` |
| Push lên GitHub | `git push origin <tên-branch>` |
| Tạo Pull Request | Thực hiện trên GitHub |
| Merge vào main | Thực hiện trên GitHub |
| Xóa branch cũ | `git branch -d <tên-branch>` & `git push origin --delete <tên-branch>` |
| Cập nhật code mới nhất | `git pull origin main` |

🚀 **Làm việc nhóm hiệu quả hơn với GitHub!** 🎯
