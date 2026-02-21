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
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className="relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors"
        style={{
          borderColor: isDragging ? "#0090ff" : "#eae7ec",
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
        <div className="space-y-2 pointer-events-none">
          <svg
            className="w-10 h-10 mx-auto"
            style={{ color: "#0090ff" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="font-medium" style={{ color: "#211f26" }}>Încarcă imaginea tatuajului dorit</p>
          <p className="text-sm" style={{ color: "#65636d" }}>
            Trage sau apasă · JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB · 1–{MAX_IMAGES} imagini
          </p>
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: "#dc2626" }}>{error}</p>}

      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative group w-24 h-24 rounded-lg overflow-hidden"
              style={{ border: "1px solid #eae7ec" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Referință ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => remove(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
              >
                Elimină
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
