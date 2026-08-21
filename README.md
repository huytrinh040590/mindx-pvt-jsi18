# Coffee Manager Demo

Project mẫu hoàn chỉnh bằng HTML/CSS/JS thuần, dùng để học:

- Firebase Authentication
- Firestore CRUD
- Cloudinary upload ảnh
- Apidog mô tả và test API

## 1. Cấu trúc thư mục

```text
coffee-manager-project/
├─ index.html
├─ style.css
├─ app.js
├─ firebase-config.example.js
├─ firestore.rules
├─ apidog-endpoints.md
└─ README.md
```

## 2. Cấu hình Firebase

### Bước 1: Tạo Web App
Vào Firebase Console -> Project settings -> Add app -> Web.

### Bước 2: Bật Authentication
- Chọn Authentication
- Sign-in method
- Bật **Email/Password**

### Bước 3: Tạo Firestore Database
- Chọn Firestore Database
- Create database
- Có thể chọn test mode lúc đầu để thử nhanh

### Bước 4: Điền config
Mở file `firebase-config.js`:

```js
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const cloudinaryConfig = {
  cloudName: "YOUR_CLOUDINARY_CLOUD_NAME",
  uploadPreset: "YOUR_UNSIGNED_UPLOAD_PRESET"
};
```


## 2.1 File hướng dẫn nhanh

Trong project có sẵn file:

- `huongdanlayconfig.js`

Cách dùng:
1. Tạo file `firebase-config.js`
2. Mở Firebase Console và Cloudinary Dashboard
3. Dán lần lượt từng giá trị theo đúng chú thích ngay trong file

Đây là file hướng dẫn, vì mỗi dòng đều ghi rõ phải lấy ở đâu.

## 3. Cấu hình Cloudinary

### Bước 1: Lấy cloud name
Trong dashboard Cloudinary sẽ có `Cloud name`.

### Bước 2: Tạo upload preset
- Vào Settings -> Upload
- Tạo **unsigned upload preset**
- Copy tên preset dán vào `uploadPreset`

> Lưu ý: unsigned preset phù hợp để học/demo. Khi làm thật, nên upload qua backend hoặc cơ chế ký bảo mật.

## 5. Firestore Rules

Dán nội dung file `firestore.rules` vào mục Firestore Rules:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;

      allow read, update, delete: if request.auth != null
                                  && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 6. Firestore index có thể cần tạo

Do project dùng:
- `where("userId", "==", currentUser.uid)`
- `orderBy("createdAt", "desc")`

nên Firestore có thể yêu cầu tạo composite index. Nếu thấy lỗi, mở link Firebase cung cấp và tạo index theo hướng dẫn.

## 7. Chức năng hiện có

- Đăng ký tài khoản
- Đăng nhập
- Đăng xuất
- Thêm sản phẩm
- Upload ảnh lên Cloudinary
- Lưu dữ liệu lên Firestore
- Hiển thị danh sách sản phẩm theo user đang đăng nhập
- Cập nhật sản phẩm
- Xóa sản phẩm
- Preview ảnh trước khi lưu

## 8. Dữ liệu lưu trong Firestore

Collection: `products`

Ví dụ document:

```json
{
  "name": "Cà phê sữa đá",
  "price": 25000,
  "description": "Đậm vị, thơm ngon",
  "imageUrl": "https://res.cloudinary.com/...jpg",
  "userId": "firebase_uid",
  "userEmail": "student@gmail.com",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 9. Cách dùng Apidog với bài này

Mở file `apidog-endpoints.md` để copy các endpoint mẫu vào Apidog.

Bạn có thể dùng Apidog theo 2 cách:

### Cách 1: Làm tài liệu API
Viết các API giả như:
- POST /register
- POST /login
- GET /products
- POST /products
- PUT /products/{id}
- DELETE /products/{id}
- POST /upload-image

### Cách 2: Tạo mock API
- Tạo response giả trong Apidog
- Test trước bằng mock
- Sau đó chuyển sang hệ thống thật bằng Firebase + Cloudinary

## 10. Lỗi thường gặp

### Lỗi 1: Không import được firebase-config.js
Bạn chưa đổi tên file config thành `firebase-config.js`.

### Lỗi 2: Upload ảnh thất bại
Kiểm tra:
- Cloud name đúng chưa
- Upload preset đúng chưa
- Preset có phải unsigned không

### Lỗi 3: Firestore báo permission denied
Kiểm tra:
- Đã đăng nhập chưa
- Rules đã publish chưa
- `userId` lưu vào document có đúng bằng `request.auth.uid` không

### Lỗi 4: Firestore báo thiếu index
Tạo composite index theo link lỗi Firebase cung cấp.
Mở console, bấm vào link create index, đợi 10 - 30s, reload lại

5. Firestore Rules đang chặn đọc
Vào Firebase Console → Firestore Database → Rules rồi thay bằng rules trong file firestore-rules đã cho sẵn.

bấm publish rồi tải lại trang

## 11. Gợi ý mở rộng

- Thêm tìm kiếm sản phẩm theo tên
- Thêm lọc theo khoảng giá
- Thêm phân trang
- Thêm trạng thái còn hàng / hết hàng
- Thêm dashboard tổng số sản phẩm
- Thêm xác nhận xóa đẹp hơn bằng modal
- Viết backend Node.js/Express thật để Apidog test API thực tế (nếu có thể)

# Thêm phần đăng xuất:
<div id="avatar-action-container">
  <button id="logout-btn">Đăng xuất</button>
</div>

Tạo index.js
// Kiểm tra nếu chưa đăng nhập thì đá về login
if (!localStorage.getItem("currentUser")) {
    window.location.href = "./login.html"
}

// Lấy nút logout
const logoutBtn = document.getElementById("logout-btn")

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        // Xóa user hiện tại
        localStorage.removeItem("currentUser")

        // Chuyển về login
        window.location.href = "./login.html"
    })
}

Gắn script vào trang index.html
