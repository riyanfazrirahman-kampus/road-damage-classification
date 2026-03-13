import { useState } from "react";
import ImgDropZone from "../form/form-elements/ImgDropZone";
import { DraggableMarker } from "./DraggableMarker";
import Button from "../ui/button/Button";

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
    <div className="grid grid-cols-1">
      <div className="space-y-6">
        <ImgDropZone
          onFileSelect={handleFileSelect}
          currentImage={previewUrl || undefined}
        />
        <DraggableMarker />
        <Button className="w-full">Simpan</Button>
      </div>
    </div>
  );
}
