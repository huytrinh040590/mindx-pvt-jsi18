import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, cloudinaryConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const el = {
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  authStatus: document.getElementById("authStatus"),
  btnRegister: document.getElementById("btnRegister"),
  btnLogin: document.getElementById("btnLogin"),
  btnLogout: document.getElementById("btnLogout"),
  productForm: document.getElementById("productForm"),
  name: document.getElementById("name"),
  price: document.getElementById("price"),
  description: document.getElementById("description"),
  imageFile: document.getElementById("imageFile"),
  previewImage: document.getElementById("previewImage"),
  btnRemoveImage: document.getElementById("btnRemoveImage"),
  productList: document.getElementById("productList"),
  loading: document.getElementById("loading"),
  emptyState: document.getElementById("emptyState"),
  btnReload: document.getElementById("btnReload"),
  btnCancelEdit: document.getElementById("btnCancelEdit"),
  formTitle: document.getElementById("formTitle"),
  submitBtn: document.getElementById("submitBtn"),
  toast: document.getElementById("toast"),
  loginCard: document.getElementById("login-card"),
};

let currentUser = null;
let editingId = null;
let existingImageUrl = "";

el.btnRegister.addEventListener("click", register);
el.btnLogin.addEventListener("click", login);
el.btnLogout.addEventListener("click", logout);
el.btnReload.addEventListener("click", loadProducts);
el.btnCancelEdit.addEventListener("click", resetForm);
el.productForm.addEventListener("submit", handleSubmitProduct);
el.imageFile.addEventListener("change", handlePreview);
el.btnRemoveImage.addEventListener("click", removeImage);

async function register() {
  const email = el.email.value.trim();
  const password = el.password.value.trim();

  if (!email || !password) {
    showToast("Vui lòng nhập email và mật khẩu.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast("Đăng ký thành công.");
  } catch (error) {
    showToast(getFirebaseErrorMessage(error.code));
  }
}

async function login() {
  const email = el.email.value.trim();
  const password = el.password.value.trim();

  if (!email || !password) {
    showToast("Vui lòng nhập email và mật khẩu.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Đăng nhập thành công.");
  } catch (error) {
    showToast(getFirebaseErrorMessage(error.code));
  }
}

async function logout() {
  try {
    await signOut(auth);
    resetForm();
    showToast("Đã đăng xuất.");
  } catch (error) {
    showToast("Không thể đăng xuất lúc này.");
  }
}

onAuthStateChanged(auth, async (user) => {
  console.log("User: ", user);
  currentUser = user;
  el.btnLogout.disabled = !user;
  el.authStatus.textContent = user
    ? `Xin chào, ${user.email}`
    : "Chưa đăng nhập";

  resetProductView();
  if (user) {
    el.loginCard.classList.add("hidden");
    await loadProducts();
  } else {
    el.emptyState.textContent = "Hãy đăng nhập để xem sản phẩm.";
    el.emptyState.classList.remove("hidden");
    el.loginCard.classList.remove("hidden");
  }
});

async function handleSubmitProduct(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Bạn cần đăng nhập trước.");
    return;
  }

  const name = el.name.value.trim();
  const price = Number(el.price.value);
  const description = el.description.value.trim();
  const file = el.imageFile.files[0];

  if (!name || Number.isNaN(price) || price < 0) {
    showToast("Vui lòng nhập tên và giá hợp lệ.");
    return;
  }

  toggleFormDisabled(true);

  try {
    let imageUrl = existingImageUrl;

    if (file) {
      imageUrl = await uploadToCloudinary(file);
    }

    if (imageUrl) {
      el.btnRemoveImage.classList.remove("hidden");
    }

    const payload = {
      name,
      price,
      description,
      imageUrl: imageUrl || "",
      userId: currentUser.uid,
      userEmail: currentUser.email,
      updatedAt: serverTimestamp(),
    };

    if (editingId) {
      await updateDoc(doc(db, "products", editingId), payload);
      showToast("Cập nhật sản phẩm thành công.");
    } else {
      await addDoc(collection(db, "products"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      showToast("Thêm sản phẩm thành công.");
    }

    resetForm();
    await loadProducts();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Có lỗi xảy ra khi lưu sản phẩm.");
  } finally {
    toggleFormDisabled(false);
  }
}

async function uploadToCloudinary(file) {
  const { cloudName, uploadPreset } = cloudinaryConfig;

  if (!cloudName || !uploadPreset) {
    throw new Error("Chưa cấu hình Cloudinary trong firebase-config.js");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Upload ảnh thất bại.");
  }

  return data.secure_url;
}

async function loadProducts() {
  resetProductView();

  if (!currentUser) {
    el.emptyState.textContent = "Hãy đăng nhập để xem sản phẩm.";
    el.emptyState.classList.remove("hidden");
    return;
  }

  el.loading.classList.remove("hidden");

  try {
    const q = query(
      collection(db, "products"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    el.productList.innerHTML = "";

    if (snapshot.empty) {
      el.emptyState.textContent =
        "Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên.";
      el.emptyState.classList.remove("hidden");
      return;
    }

    el.emptyState.classList.add("hidden");

    snapshot.forEach((item) => {
      const product = item.data();
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.imageUrl || "https://placehold.co/600x400?text=No+Image"}" alt="${escapeHtml(product.name)}" />
        <div class="product-content">
          <h3>${escapeHtml(product.name)}</h3>
          <p class="product-meta">${formatCurrency(product.price)}</p>
          <p class="product-desc">${escapeHtml(product.description || "Không có mô tả")}</p>
          <div class="product-actions">
            <button class="small-btn edit-btn" data-action="edit">Sửa</button>
            <button class="small-btn delete-btn" data-action="delete">Xóa</button>
          </div>
        </div>
      `;

      const [editButton, deleteButton] = card.querySelectorAll("button");

      editButton.addEventListener("click", () => startEdit(item.id, product));
      deleteButton.addEventListener("click", () =>
        removeProduct(item.id, product.name),
      );

      el.productList.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    el.emptyState.textContent =
      "Không tải được dữ liệu. Kiểm tra Firestore rules và index.";
    el.emptyState.classList.remove("hidden");
  } finally {
    el.loading.classList.add("hidden");
  }
}

function startEdit(id, product) {
  editingId = id;
  existingImageUrl = product.imageUrl || "";

  el.formTitle.textContent = "Cập nhật sản phẩm";
  el.submitBtn.textContent = "Lưu thay đổi";
  el.btnCancelEdit.classList.remove("hidden");

  el.name.value = product.name || "";
  el.price.value = product.price ?? "";
  el.description.value = product.description || "";

  if (existingImageUrl) {
    el.previewImage.src = existingImageUrl;
    el.previewImage.classList.remove("hidden");
    el.btnRemoveImage.classList.remove("hidden");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeProduct(id, name) {
  const confirmed = window.confirm(
    `Bạn có chắc muốn xóa sản phẩm \"${name}\" không?`,
  );
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "products", id));
    showToast("Đã xóa sản phẩm.");

    if (editingId === id) {
      resetForm();
    }

    await loadProducts();
  } catch (error) {
    console.error(error);
    showToast("Xóa sản phẩm thất bại.");
  }
}

function resetForm() {
  editingId = null;
  existingImageUrl = "";
  el.productForm.reset();
  el.formTitle.textContent = "Thêm sản phẩm";
  el.submitBtn.textContent = "Lưu sản phẩm";
  el.btnCancelEdit.classList.add("hidden");
  el.previewImage.src = "";
  el.previewImage.classList.add("hidden");
  el.btnRemoveImage.classList.add("hidden");
}

function handlePreview() {
  const file = el.imageFile.files[0];
  if (!file) {
    if (!existingImageUrl) {
      el.previewImage.classList.add("hidden");
      el.previewImage.src = "";
      el.btnRemoveImage.classList.add("hidden");
    }
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    el.previewImage.src = e.target.result;
    el.previewImage.classList.remove("hidden");
    el.btnRemoveImage.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  const file = el.imageFile.files[0];

  if (file || existingImageUrl) {
    el.imageFile.value = "";
    existingImageUrl = "";
    el.previewImage.classList.add("hidden");
    el.previewImage.src = "";
    el.btnRemoveImage.classList.add("hidden");
  }
}

function resetProductView() {
  el.loading.classList.add("hidden");
  el.productList.innerHTML = "";
  el.emptyState.classList.add("hidden");
}

function toggleFormDisabled(disabled) {
  const controls = el.productForm.querySelectorAll("input, textarea, button");
  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.toast.classList.add("hidden");
  }, 2500);
}

function getFirebaseErrorMessage(code) {
  const map = {
    "auth/email-already-in-use": "Email này đã được đăng ký.",
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/weak-password": "Mật khẩu phải từ 6 ký tự trở lên.",
    "auth/invalid-credential": "Sai email hoặc mật khẩu.",
    "auth/missing-password": "Bạn chưa nhập mật khẩu.",
    "auth/too-many-requests": "Thao tác quá nhiều lần. Vui lòng thử lại sau.",
  };

  return map[code] || `Có lỗi xảy ra: ${code}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
