import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import PageWrapper from "../components/common/PageWrapper";
import ImgDropZone from "../components/form/form-elements/ImgDropZone";

export default function PageClassification() {
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
    <PageWrapper>
      <PageMeta
        title="Klasifikasi"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="grid grid-cols-1">
        <div className="space-y-6">
          {/* <DropzoneComponent /> */}
          <ImgDropZone
            onFileSelect={handleFileSelect}
            currentImage={previewUrl || undefined}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
