// =========================
// FIREBASE + CLOUDINARY CONFIG
// =========================
// Cách dùng:
// 1) tạo file firebase-config.js
// 2) Dán đúng thông tin của bạn vào từng dòng bên dưới
// 3) Lưu file rồi chạy project bằng Live Server

export const firebaseConfig = {
  // Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
  // Dòng cần copy: apiKey
  apiKey: "DAN_API_KEY_FIREBASE_VAO_DAY",

  // Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
  // Dòng cần copy: authDomain
  // Ví dụ: ten-du-an.firebaseapp.com
  authDomain: "DAN_AUTH_DOMAIN_FIREBASE_VAO_DAY",

  // Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
  // Dòng cần copy: projectId
  projectId: "DAN_PROJECT_ID_FIREBASE_VAO_DAY",

  // Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
  // Dòng cần copy: storageBucket
  // Ví dụ thường là: ten-du-an.firebasestorage.app hoặc ten-du-an.appspot.com
  storageBucket: "DAN_STORAGE_BUCKET_FIREBASE_VAO_DAY",

  // Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
  // Dòng cần copy: messagingSenderId
  messagingSenderId: "DAN_MESSAGING_SENDER_ID_FIREBASE_VAO_DAY",

  // Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
  // Dòng cần copy: appId
  appId: "DAN_APP_ID_FIREBASE_VAO_DAY"
};

export const cloudinaryConfig = {
  // Cloudinary Dashboard -> Product Environment Credentials -> Cloud name
  cloudName: "DAN_CLOUD_NAME_CLOUDINARY_VAO_DAY",

  // Cloudinary -> Settings -> Upload -> Upload presets -> tạo preset kiểu Unsigned
  // Copy đúng tên preset và dán vào đây
  uploadPreset: "DAN_UNSIGNED_UPLOAD_PRESET_VAO_DAY"
};
