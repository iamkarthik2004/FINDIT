import { useRef, useState } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { cls } from '../utils/helpers';

export default function PhotoUpload({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && (
        <span className="input-label">
          {label}
          <span className="ml-1 text-ink-soft">(optional)</span>
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
        aria-label={label || 'Upload photo'}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cls(
          'relative flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition duration-200',
          dragging
            ? 'border-primary bg-primary-soft'
            : 'border-lavender-200 bg-lavender-50/60 hover:border-primary/50 hover:bg-lavender-50',
        )}
        aria-label="Upload item photo"
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Uploaded item preview"
              className="max-h-52 w-full rounded-xl object-cover shadow-soft"
            />
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-dark">
              <UploadCloud size={14} aria-hidden="true" /> Replace photo
            </span>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <ImagePlus size={22} aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-ink">Drag &amp; drop a photo here</p>
            <p className="text-xs text-ink-soft">or click to browse from your device</p>
            <span className="mt-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white">
              Choose photo
            </span>
          </>
        )}
      </button>
    </div>
  );
}