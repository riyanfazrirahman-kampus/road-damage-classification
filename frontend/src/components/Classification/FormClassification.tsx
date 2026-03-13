import { useState } from "react";
import ImgDropZone from "../form/form-elements/ImgDropZone";

export default function FormClassification() {
  // Img Dropzone
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nama_bank: "",
    url_img_bank_old: "",
    aktif: 1,
    img_bank: null as File | null,
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      img_bank: file,
    }));

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <div>
      {/* <DropzoneComponent /> */}
      <ImgDropZone
        onFileSelect={handleFileSelect}
        currentImage={previewUrl || undefined}
      />
    </div>
  );
}
