import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import ClassificationImage from "./ClassificationImage";
import DraggableMarker from "./DraggableMarker";
import { classificationImageSave, fetchStatus } from "@/api/classificationApi";

export default function FormClassification() {
  const [file, setFile] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [modelLoading, setModelLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);

  const [location, setLocation] = useState({
    latitude: -2.2074064,
    longitude: 113.9152386,
    address: "",
  });

  const checkModelStatus = async () => {
    try {
      setModelLoading(true);

      const status = await fetchStatus();

      setModelReady(status === "ok");
    } catch (err) {
      console.error(err);
      setModelReady(false);
    } finally {
      setModelLoading(false);
    }
  };

  useEffect(() => {
    checkModelStatus();
  }, []);

  const handleSave = async () => {
    if (!file) {
      alert("Silakan upload gambar terlebih dahulu");
      return;
    }

    if (!predictions) {
      alert("Prediksi belum tersedia");
      return;
    }

    try {
      setSaving(true);

      const res = await classificationImageSave(
        file,
        "Model-RDC-1.1",
        predictions,
        location,
      );

      console.log("saved", res);
      alert("Data berhasil disimpan.");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 mb-15">
      {modelLoading ? (
        <div className="rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Model sedang dicek...</p>
        </div>
      ) : !modelReady ? (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6 text-center space-y-3">
          <p className="text-sm text-yellow-700">
            Model belum aktif. Klik refresh untuk mencoba lagi.
          </p>

          <Button onClick={checkModelStatus} size="sm">
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <ClassificationImage
            setFile={setFile}
            setPredictions={setPredictions}
          />

          <DraggableMarker setLocation={setLocation} />

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={saving}
            size="lg"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      )}
    </div>
  );
}
