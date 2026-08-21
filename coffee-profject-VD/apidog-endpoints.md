# Bộ endpoint mẫu để mô tả trong Apidog

Bạn có thể tạo project trong Apidog với các endpoint mô phỏng sau:

## 1) Auth
### POST /register
Request body:
```json
{
  "email": "student@gmail.com",
  "password": "123456"
}
```

Response mẫu:
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "uid": "firebase_uid_demo",
    "email": "student@gmail.com"
  }
}
```

### POST /login
Request body:
```json
{
  "email": "student@gmail.com",
  "password": "123456"
}
```

Response mẫu:
```json
{
  "message": "Đăng nhập thành công",
  "token": "demo_token",
  "user": {
    "uid": "firebase_uid_demo",
    "email": "student@gmail.com"
  }
}
```

## 2) Product
### GET /products
Response mẫu:
```json
[
  {
    "id": "abc123",
    "name": "Cà phê sữa đá",
    "price": 25000,
    "description": "Thơm, đậm vị",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }
]
```

### POST /products
Request body:
```json
{
  "name": "Bạc xỉu",
  "price": 30000,
  "description": "Nhiều sữa, ít cà phê",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
}
```

### PUT /products/{id}
Request body:
```json
{
  "name": "Bạc xỉu nóng",
  "price": 32000,
  "description": "Phiên bản nóng",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample2.jpg"
}
```

### DELETE /products/{id}
Response mẫu:
```json
{
  "message": "Xóa thành công"
}
```

## 3) Upload ảnh
### POST /upload-image
Form-data:
- file: image

Response mẫu:
```json
{
  "message": "Upload thành công",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample3.jpg"
}
```
