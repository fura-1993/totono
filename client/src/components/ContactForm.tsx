/**
 * ContactForm - MySQL連携のお問い合わせフォーム
 * 写真添付対応（最大10枚、1枚20MBまで）
 * Manus内蔵データベース（MySQL）に保存
 */

import { useState, useRef, FormEvent } from "react";
import { useLocation } from "wouter";
import { Camera, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUtmParams } from "@/hooks/useUtmParams";
import { trackFormSubmit } from "@/lib/analytics";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  error?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const remainingSlots = MAX_FILES - files.length;
    
    if (remainingSlots <= 0) {
      toast.error(`写真は最大${MAX_FILES}枚までです`);
      return;
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    
    const processedFiles: UploadedFile[] = filesToAdd.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (file.size > MAX_FILE_SIZE) {
        return {
          id,
          file,
          preview: "",
          error: "ファイルサイズが20MBを超えています",
        };
      }

      if (!file.type.startsWith("image/")) {
        return {
          id,
          file,
          preview: "",
          error: "画像ファイルのみアップロード可能です",
        };
      }

      const preview = URL.createObjectURL(file);
      
      return {
        id,
        file,
        preview,
      };
    });

    setFiles((prev) => [...prev, ...processedFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    fileInputRef.current?.click();
  };

  const [, setLocation] = useLocation();
  const { getUtmParamsForForm, getUtmSummary } = useUtmParams();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");

    try {
      const formData = new FormData(e.currentTarget);
      
      // UTMパラメータを取得
      const utmParams = getUtmParamsForForm();
      
      // サービスタイプを取得
      const serviceTypes = formData.getAll('service').join(', ');
      
      // FormDataを作成（写真を含む）
      const submitData = new FormData();
      submitData.append('name', formData.get('name') as string);
      submitData.append('email', formData.get('email') as string || '');
      submitData.append('phone', formData.get('phone') as string || '');
      submitData.append('address', formData.get('address') as string || '');
      submitData.append('serviceType', serviceTypes || '');
      submitData.append('message', `【ご依頼内容】${serviceTypes}\n【詳細】${formData.get('details') || 'なし'}\n【希望時期】${formData.get('timing') || '未選択'}\n【連絡方法】${formData.get('contact_method') || '未選択'}`);
      submitData.append('utmParams', JSON.stringify(utmParams));
      submitData.append('trafficSource', getUtmSummary());
      submitData.append('landingPage', window.location.href);
      submitData.append('referrer', document.referrer || '');
      
      // 写真を追加
      files.filter(f => !f.error).forEach(f => {
        submitData.append('photos', f.file);
      });
      
      // MySQL APIに保存（multipart/form-data）
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        body: submitData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // GA4コンバージョントラッキング
        trackFormSubmit('contact_form');
        
        // 送信成功ポップアップを表示
        toast.success("お問い合わせを送信しました！\n確認メールをお送りしましたのでご確認ください。", {
          duration: 5000,
          style: {
            background: '#2d5a27',
            color: 'white',
            fontSize: '16px',
            padding: '16px',
          },
        });
        
        // Reset form
        formRef.current?.reset();
        setFiles([]);
        
        // 2秒後にサンクスページへリダイレクト
        setTimeout(() => {
          setLocation("/thanks");
        }, 2000);
        return;
      } else {
        throw new Error(result.error || "送信に失敗しました");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormStatus("error");
      toast.error("送信に失敗しました。お手数ですがお電話でお問い合わせください。");
      setTimeout(() => setFormStatus("idle"), 3000);
    }
  };

  return (
    <form 
      ref={formRef}
      className="space-y-6" 
      onSubmit={handleSubmit}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            お名前 <span className="text-coral">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest"
            placeholder="山田 太郎"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest"
            placeholder="example@email.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            電話番号 <span className="text-coral">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest"
            placeholder="090-1234-5678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            ご住所（市区町村まで）<span className="text-coral">*</span>
          </label>
          <input
            type="text"
            name="address"
            required
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest"
            placeholder="茨城県桜川市"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          ご依頼内容 <span className="text-coral">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["剪定", "伐採", "草刈り", "防草シート", "人工芝", "空き家管理", "その他"].map((item) => (
            <label key={item} className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
              <input type="checkbox" name="service" value={item} className="rounded border-input text-forest focus:ring-forest" />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          本数・面積・状況など
        </label>
        <textarea
          name="details"
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest resize-none"
          placeholder="例）松の木3本、高さ約3m。隣家との境界近くにあり、枝が越境しそうです。"
        />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            ご希望時期
          </label>
          <select
            name="timing"
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="">選択してください</option>
            <option value="なるべく早く">なるべく早く</option>
            <option value="今週中">今週中</option>
            <option value="今月中">今月中</option>
            <option value="相談して決めたい">相談して決めたい</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            ご希望の連絡方法
          </label>
          <select
            name="contact_method"
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="">選択してください</option>
            <option value="電話">電話</option>
            <option value="メール">メール</option>
            <option value="LINE">LINE</option>
          </select>
        </div>
      </div>
      
      {/* Photo Upload Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          写真添付（最大10枚まで、各1枚20MB以下）
        </label>
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-3">
            <strong>写真があるとより正確な概算が可能です</strong><br />
            庭木や草の状態がわかる写真をお送りください。
          </p>
          
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
              ref={fileInputRef}
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
                className="mt-2"
              >
                <Camera className="w-4 h-4 mr-2" />
                写真を選択
              </Button>
            </div>
          </div>
          
          {/* Preview thumbnails */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  {file.error ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                      <span className="text-xs text-destructive">{file.error}</span>
                    </div>
                  ) : (
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={formStatus === "submitting"}
        className="w-full bg-coral hover:bg-coral/90 text-white py-6 text-lg font-bold rounded-xl shadow-lg"
      >
        {formStatus === "submitting" ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            送信中...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            無料見積もりを依頼する
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        ※ 送信後、12時間以内にご連絡いたします。<br />
        お急ぎの方はお電話（080-9426-8236）でお問い合わせください。
      </p>
    </form>
  );
}
