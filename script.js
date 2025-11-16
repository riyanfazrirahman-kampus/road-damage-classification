// --- ELEMEN DOM ---
const uploadArea = document.getElementById("uploadArea");
const placeholderUpload = document.getElementById("placeholderUpload");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const loader = document.getElementById("loader");
const resultContainer = document.getElementById("resultContainer");
const resultsList = document.getElementById("resultsList");
const errorMessageDiv = document.getElementById("errorMessage");

// --- KONFIGURASI BASE URL ---
const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "localhost"
    ? "http://localhost:10000"
    : "https://road-damage-api.onrender.com";

// --- EVENT LISTENER ---
// Klik area upload untuk membuka file explorer
uploadArea.addEventListener("click", () => imageUpload.click());

// Saat gambar dipilih, langsung proses
imageUpload.addEventListener("change", handleImageSelect);

// --- DRAG & DROP EVENT ---
uploadArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadArea.classList.remove("dragover");
  if (event.dataTransfer.files.length) {
    imageUpload.files = event.dataTransfer.files;
    handleImageSelect({ target: { files: event.dataTransfer.files } });
  }
});

// --- FUNGSI-FUNGSI ---

// 🔹 Ketika gambar dipilih atau di-drop
function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      placeholderUpload.style.display = "none";
      resetUI();

      // 🔸 Langsung prediksi otomatis
      handlePredict(file);
    };
    reader.readAsDataURL(file);
  }
}

// 🔹 Kirim gambar ke backend API untuk diprediksi
async function handlePredict(file) {
  if (!file) {
    file = imageUpload.files[0];
  }
  if (!file) {
    showError("Silakan pilih gambar terlebih dahulu.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setLoadingState(true);

  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Server error: ${response.statusText}`
      );
    }

    const data = await response.json();
    displayResult(data);
  } catch (error) {
    console.error("Klasifikasi Error:", error);
    showError(`Gagal mendapatkan prediksi: ${error.message}`);
  } finally {
    setLoadingState(false);
  }
}

// 🔹 Tampilkan hasil prediksi
function displayResult(data) {
  resultsList.innerHTML = "";

  data.predictions.forEach((pred) => {
    const li = document.createElement("li");
    const confidenceText = `${pred.confidence}%`;

    li.innerHTML = `
      <span>${pred.class}</span>
      <span>${confidenceText}</span>
    `;

    resultsList.appendChild(li);
  });

  resultContainer.style.display = "block";
  errorMessageDiv.style.display = "none";
}

// 🔹 Tampilkan pesan error
function showError(message) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
  resultContainer.style.display = "none";
}

// 🔹 Ubah tampilan saat loading
function setLoadingState(isLoading) {
  loader.style.display = isLoading ? "block" : "none";
  if (isLoading) {
    resultContainer.style.display = "none";
    errorMessageDiv.style.display = "none";
  }
}

// 🔹 Reset tampilan hasil/error
function resetUI() {
  resultContainer.style.display = "none";
  errorMessageDiv.style.display = "none";
}
