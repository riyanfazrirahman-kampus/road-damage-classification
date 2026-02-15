export interface Prediction {
  class: string;
  confidence: number;
}

export interface ClassificationData {
  id: string;
  image: {
    url: string;
    public_id: string;
    bytes: number;
    format: string;
  };
  model: string;
  predictions: Prediction[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  created_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  updated_at: {
    _seconds: number;
    _nanoseconds: number;
  };
}
const BASE_URL = "http://localhost:5000/api";

export async function fetchClassificationHistory(): Promise<
  ClassificationData[]
> {
  const res = await fetch(`${BASE_URL}/classification/history`);

  if (!res.ok) throw new Error("Gagal fetch history");

  const json = await res.json();
  if (json.status !== "success") return [];

  return json.data;
}
