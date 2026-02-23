"use client";
import { useCallback, useState } from "react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;
const MAX_DIM = 1024;

async function resizeImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ images, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError("");
      const accepted = Array.from(files).filter((f) =>
        ["image/jpeg", "image/png", "image/webp"].includes(f.type)
      );

      const oversized = accepted.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
      if (oversized.length) {
        setError(`Fișierele trebuie să fie sub ${MAX_SIZE_MB}MB.`);
        return;
      }

      const remaining = MAX_IMAGES - images.length;
      const toAdd = accepted.slice(0, remaining);

      if (accepted.length > remaining) {
        setError(`Poți încărca maxim ${MAX_IMAGES} imagini.`);
      }

      const dataUrls = await Promise.all(toAdd.map(readFile));
      const resized = await Promise.all(dataUrls.map(resizeImage));
      onChange([...images, ...resized]);
    },
    [images, onChange]
  );

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        className="relative text-center cursor-pointer transition-all"
        style={{
          border: `2px dashed ${isDragging ? "#0090ff" : "#c8c6ce"}`,
          borderRadius: 16,
          padding: "32px 20px",
          backgroundColor: isDragging ? "#e6f4fe" : "#fdfcfd",
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="pointer-events-none space-y-3">
          {/* Icon */}
          <div
            className="mx-auto flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: isDragging ? "#c5e0fc" : "#e6f4fe",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0090ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "#211f26", fontSize: "1rem" }}>
              Apasă pentru a adăuga imagini
            </p>
            <p className="mt-1" style={{ color: "#65636d", fontSize: "0.85rem" }}>
              sau trage fișierele aici
            </p>
          </div>
          <p style={{ color: "#a09fa6", fontSize: "0.8rem" }}>
            JPG · PNG · WEBP · max {MAX_SIZE_MB}MB · până la {MAX_IMAGES} imagini
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>
      )}

      {/* Thumbnails */}
      {images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${MAX_IMAGES}, 1fr)`,
            gap: 10,
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="relative group overflow-hidden"
              style={{ aspectRatio: "1", borderRadius: 12, border: "1.5px solid #eae7ec" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Referință ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute inset-0 flex items-center justify-center font-medium transition-opacity opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "0.8rem" }}
              >
                Elimină
              </button>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: MAX_IMAGES - images.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                aspectRatio: "1",
                borderRadius: 12,
                border: "1.5px dashed #eae7ec",
                backgroundColor: "#fdfcfd",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
