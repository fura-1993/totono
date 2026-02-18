/**
 * PhotoUploader - 写真添付コンポーネント
 * 最大10枚、1枚あたり20MBまで
 */

import { useState, useRef } from "react";
import { Camera, X, Upload, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  error?: string;
}

export function PhotoUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const remainingSlots = MAX_FILES - files.length;
    
    if (remainingSlots <= 0) {
      alert(`写真は最大${MAX_FILES}枚までです`);
      return;
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    
    const processedFiles: UploadedFile[] = filesToAdd.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          id,
          file,
          preview: "",
          error: "ファイルサイズが20MBを超えています",
        };
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        return {
          id,
          file,
          preview: "",
          error: "画像ファイルのみアップロード可能です",
        };
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      
      return {
        id,
        file,
        preview,
      };
    });

    setFiles((prev) => [...prev, ...processedFiles]);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive
            ? "border-forest bg-forest/5"
            : "border-border hover:border-forest/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-forest" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              写真をドラッグ＆ドロップ
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              または
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            ファイルを選択
          </Button>
          <p className="text-xs text-muted-foreground">
            {files.length}/{MAX_FILES}枚 • 1枚あたり最大20MB
          </p>
        </div>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              {file.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-destructive/10">
                  <AlertCircle className="w-6 h-6 text-destructive mb-1" />
                  <p className="text-[10px] text-destructive text-center leading-tight">
                    {file.error}
                  </p>
                </div>
              ) : (
                <>
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {!file.error && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                  <p className="text-[10px] text-white truncate">
                    {(file.file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {files.filter(f => !f.error).map((file, index) => (
        <input
          key={file.id}
          type="hidden"
          name={`photo_${index + 1}`}
          value={file.file.name}
        />
      ))}
    </div>
  );
}

export default PhotoUploader;
