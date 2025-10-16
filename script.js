// --- ELEMEN DOM ---
const uploadArea = document.getElementById("uploadArea");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const predictButton = document.getElementById("predictButton");
const loader = document.getElementById("loader");
const resultContainer = document.getElementById("resultContainer");
const resultsList = document.getElementById("resultsList");
const errorMessageDiv = document.getElementById("errorMessage");

// --- EVENT LISTENER ---
uploadArea.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener("change", handleImageSelect);
predictButton.addEventListener("click", handlePredict);

// Drag and Drop Events
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

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      predictButton.disabled = false;
      resetUI();
    };
    reader.readAsDataURL(file);
  }
}

async function handlePredict() {
  const file = imageUpload.files[0];
  if (!file) {
    showError("Silakan pilih gambar terlebih dahulu.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setLoadingState(true);

  try {
    const response = await fetch(
      `https://road-damage-api.onrender.com/predict`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Server error: ${response.statusText}`
      );
    }

    const data = await response.json();
    displayResult(data);
  } catch (error) {
    console.error("Prediction Error:", error);
    showError(`Gagal mendapatkan prediksi: ${error.message}`);
  } finally {
    setLoadingState(false);
  }
}

function displayResult(data) {
  // Kosongkan hasil sebelumnya
  resultsList.innerHTML = "";

  // Loop melalui prediksi dan buat elemen li
  // ... di dalam fungsi displayResult
  data.predictions.forEach((pred) => {
    const li = document.createElement("li");

    // Langsung gunakan nilai confidence dari backend dan tambahkan '%'
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

function showError(message) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
  resultContainer.style.display = "none";
}

function setLoadingState(isLoading) {
  predictButton.disabled = isLoading;
  loader.style.display = isLoading ? "block" : "none";
  if (isLoading) {
    resultContainer.style.display = "none";
    errorMessageDiv.style.display = "none";
  }
}

function resetUI() {
  resultContainer.style.display = "none";
  errorMessageDiv.style.display = "none";
}
