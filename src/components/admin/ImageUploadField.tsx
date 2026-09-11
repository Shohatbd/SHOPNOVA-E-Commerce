import React, { useRef, useState } from 'react';
import { Upload, Link, Check, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  recommendedSize?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'logo' | 'any';
  allowUrl?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://images.unsplash.com/... or upload a file',
  helpText,
  recommendedSize,
  aspectRatio = 'any',
  allowUrl = true,
}) => {
  const { isBn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(value && value.startsWith('http') ? 'url' : 'upload');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError(isBn ? 'অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (PNG, JPG, WebP, SVG, GIF) সিলেক্ট করুন।' : 'Please select a valid image file (PNG, JPG, WebP, SVG, GIF).');
      return;
    }

    // Support up to 15MB for high-resolution images
    if (file.size > 15 * 1024 * 1024) {
      setError(isBn ? 'ফাইলের আকার সর্বোচ্চ 15MB এর মধ্যে হতে হবে।' : 'File size must be within 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setError(isBn ? 'ফাইল লোড করতে সমস্যা হয়েছে।' : 'Error loading file.');
        return;
      }

      // If SVG or small file, keep original
      if (file.type.includes('svg') || file.size <= 2 * 1024 * 1024) {
        onChange(result);
        return;
      }

      // For large high-res image files, preserve ultra-high clarity (max 2400px width/height, 0.94 quality)
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 2400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.94);
          onChange(optimized);
        } else {
          onChange(result);
        }
      };
      img.onerror = () => {
        onChange(result);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setError(isBn ? 'ফাইল লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Error loading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-bold block text-xs">
          {label}
        </label>
        
        {allowUrl && (
          <div className="flex items-center bg-[#14171E] border border-[#2C323F] rounded-lg p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-2.5 h-2.5" />
              <span>{isBn ? 'ডিভাইস থেকে আপলোড' : 'Upload File'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link className="w-2.5 h-2.5" />
              <span>{isBn ? 'ইমেজ URL' : 'Image URL'}</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'upload' ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-[#2C323F] hover:border-amber-500/50 bg-[#14171E]/60 hover:bg-[#14171E]'
            }`}
          >
            {value ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="relative group">
                  <img
                    src={value}
                    alt="Uploaded Preview"
                    className="w-16 h-16 rounded-xl object-contain bg-black/40 border border-[#2C323F] p-1"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity">
                    {isBn ? 'পরিবর্তন' : 'Change'}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ইমেজ সিলেক্ট করা হয়েছে' : 'Image Selected'}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isBn
                      ? 'অন্য ছবি দিতে এখানে ক্লিক করুন অথবা টেনে এনে ছেড়ে দিন (Drag & Drop)'
                      : 'Click here or drag & drop to replace with a new image'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 py-1">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-white">
                  {isBn ? 'ডিভাইস থেকে ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload image from your device'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'PNG, JPG, WebP, SVG সর্বোচ্চ 15MB (Drag & Drop সাপোর্টেড)' : 'PNG, JPG, WebP, SVG up to 15MB (Drag & Drop supported)'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#14171E] border border-[#2C323F] rounded-xl py-2.5 pl-3 pr-9 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 p-1"
              title={isBn ? "মুছুন" : "Clear"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-semibold">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {(helpText || recommendedSize) && (
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          {helpText && <span>{helpText}</span>}
          {recommendedSize && (
            <span className="text-amber-400/80 font-mono ml-auto">
              {isBn ? 'প্রস্তাবিত সাইজ: ' : 'Recommended size: '}{recommendedSize}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
