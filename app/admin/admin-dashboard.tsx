"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type InquiryStatus = "new" | "contacted" | "quoted" | "completed" | "cancelled";

type Inquiry = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  serviceType: string | null;
  services: unknown;
  details: string | null;
  preferredTiming: string | null;
  preferredContactMethod: string | null;
  photoCount: number;
  message: string;
  utmParams: unknown;
  trafficSource: string | null;
  landingPage: string | null;
  referrer: string | null;
  adminNotificationSentAt: string | null;
  autoReplySentAt: string | null;
  status: InquiryStatus;
  createdAt: string;
  photos: { id: number; url: string; filename: string | null; mimeType?: string | null; fileSize?: number | null }[];
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  serviceType: string | null;
  workDate: string | null;
  details: string | null;
  duration: string | null;
  scope: string | null;
  imageUrl: string | null;
  isPublished: number;
  displayOrder: number;
};

const STATUS_OPTIONS: InquiryStatus[] = ["new", "contacted", "quoted", "completed", "cancelled"];
const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "新規",
  contacted: "連絡済み",
  quoted: "見積提示",
  completed: "成約",
  cancelled: "失注",
};

function parseServices(item: Inquiry): string[] {
  if (Array.isArray(item.services)) {
    return item.services.map((value) => String(value).trim()).filter(Boolean);
  }
  if (typeof item.services === "string" && item.services.trim()) {
    try {
      const parsed = JSON.parse(item.services);
      if (Array.isArray(parsed)) {
        return parsed.map((value) => String(value).trim()).filter(Boolean);
      }
    } catch {
      return item.services.split(",").map((value) => value.trim()).filter(Boolean);
    }
  }
  if (item.serviceType) {
    return item.serviceType.split(",").map((value) => value.trim()).filter(Boolean);
  }
  return [];
}

export function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [savingAchievement, setSavingAchievement] = useState(false);
  const [achievementFormKey, setAchievementFormKey] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [inqRes, achRes] = await Promise.all([
        fetch("/api/inquiries", { cache: "no-store" }),
        fetch("/api/admin/achievements", { cache: "no-store" }),
      ]);

      if (!inqRes.ok) throw new Error("問い合わせ一覧の取得に失敗しました");
      if (!achRes.ok) throw new Error("実績一覧の取得に失敗しました");

      setInquiries(await inqRes.json());
      setAchievements(await achRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const inquirySummary = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter((item) => item.status === "new").length,
      done: inquiries.filter((item) => item.status === "completed").length,
    };
  }, [inquiries]);

  const updateInquiryStatus = async (id: number, status: InquiryStatus) => {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "ステータス更新に失敗しました");
    }

    setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const onCreateAchievement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSavingAchievement(true);
    setError("");

    try {
      const res = await fetch("/api/admin/achievements", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "実績の作成に失敗しました");

      e.currentTarget.reset();
      setAchievementFormKey((key) => key + 1);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "実績の作成に失敗しました");
    } finally {
      setSavingAchievement(false);
    }
  };

  const onUpdateAchievement = async (e: FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/admin/achievements/${id}`, {
      method: "PATCH",
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || "実績の更新に失敗しました");
    }

    setEditingId(null);
    await fetchAll();
  };

  const onDeleteAchievement = async (id: number) => {
    if (!window.confirm("この実績を削除しますか？")) return;

    const res = await fetch(`/api/admin/achievements/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || "削除に失敗しました");
    }

    await fetchAll();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">管理画面</h1>
            <p className="text-sm text-muted-foreground">問い合わせ管理と施工実績投稿</p>
          </div>
          <button onClick={logout} className="rounded-lg border border-input bg-white px-4 py-2 text-sm">
            ログアウト
          </button>
        </header>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">総問い合わせ</p>
            <p className="text-2xl font-bold">{inquirySummary.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">新規対応待ち</p>
            <p className="text-2xl font-bold text-coral">{inquirySummary.new}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">完了</p>
            <p className="text-2xl font-bold text-forest">{inquirySummary.done}</p>
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">実績を投稿</h2>
          <form key={achievementFormKey} onSubmit={onCreateAchievement} className="grid md:grid-cols-2 gap-4">
            <input name="title" required placeholder="タイトル（例: 草刈り｜桜川市 S様邸）" className="border border-input rounded-lg px-3 py-2" />
            <input name="location" placeholder="エリア（例: 茨城県桜川市）" className="border border-input rounded-lg px-3 py-2" />
            <input name="serviceType" placeholder="サービス種別（例: 草刈り）" className="border border-input rounded-lg px-3 py-2" />
            <input name="workDate" type="date" className="border border-input rounded-lg px-3 py-2" />
            <input name="duration" placeholder="作業時間（例: 半日）" className="border border-input rounded-lg px-3 py-2" />
            <input name="scope" placeholder="作業規模（例: 約50㎡）" className="border border-input rounded-lg px-3 py-2" />
            <input name="displayOrder" type="number" defaultValue={0} className="border border-input rounded-lg px-3 py-2" />
            <label className="flex items-center gap-2 text-sm">
              <input name="isPublished" type="checkbox" value="true" defaultChecked />
              公開する
            </label>
            <textarea name="description" required placeholder="概要説明" className="md:col-span-2 border border-input rounded-lg px-3 py-2 min-h-24" />
            <textarea name="details" placeholder="詳細説明（任意）" className="md:col-span-2 border border-input rounded-lg px-3 py-2 min-h-24" />
            <input name="image" type="file" accept="image/*" className="md:col-span-2 border border-input rounded-lg px-3 py-2" />
            <input name="imageUrl" placeholder="画像URL（任意。ファイル未指定時に利用）" className="md:col-span-2 border border-input rounded-lg px-3 py-2" />
            <button disabled={savingAchievement} className="md:col-span-2 bg-forest text-white rounded-lg px-4 py-2 disabled:opacity-60">
              {savingAchievement ? "保存中..." : "実績を追加"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">問い合わせ一覧</h2>
          {loading ? <p>読み込み中...</p> : null}
          <div className="space-y-4">
            {inquiries.map((item) => {
              const serviceItems = parseServices(item);
              return (
              <article key={item.id} className="border border-border rounded-xl p-4 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">#{item.id} {item.name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleString("ja-JP")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded-full bg-muted px-2 py-1 text-muted-foreground">
                      {STATUS_LABEL[item.status]}
                    </span>
                    <select
                      value={item.status}
                      onChange={async (e) => {
                        try {
                          await updateInquiryStatus(item.id, e.target.value as InquiryStatus);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "更新に失敗しました");
                        }
                      }}
                      className="border border-input rounded-lg px-3 py-2 text-sm"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">メール:</span> {item.email || "-"}</p>
                    <p><span className="text-muted-foreground">電話:</span> {item.phone || "-"}</p>
                    <p><span className="text-muted-foreground">住所:</span> {item.address || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">希望時期:</span> {item.preferredTiming || "-"}</p>
                    <p><span className="text-muted-foreground">希望連絡方法:</span> {item.preferredContactMethod || "-"}</p>
                    <p><span className="text-muted-foreground">添付写真:</span> {item.photoCount}枚</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">ご依頼内容</p>
                  <div className="flex flex-wrap gap-2">
                    {serviceItems.length ? (
                      serviceItems.map((service, idx) => (
                        <span key={`${item.id}-service-${idx}`} className="text-xs rounded-full bg-forest/10 text-forest px-2 py-1">
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">未選択</span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted rounded-lg p-3">
                    {item.details || "詳細未入力"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">受付メモ（原文）</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted rounded-lg p-3">{item.message}</p>
                </div>

                <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                  <p>流入情報: {item.trafficSource || "-"}</p>
                  <p>LP URL: {item.landingPage || "-"}</p>
                  <p>リファラ: {item.referrer || "-"}</p>
                  <p>自動返信: {item.autoReplySentAt ? new Date(item.autoReplySentAt).toLocaleString("ja-JP") : "未送信/未設定"}</p>
                </div>

                {item.photos?.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">添付写真</p>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {item.photos.map((photo) => (
                        <a
                          key={photo.id}
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group block overflow-hidden rounded-lg border border-border bg-muted"
                        >
                          <img
                            src={photo.url}
                            alt={photo.filename || `inquiry-photo-${photo.id}`}
                            className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">投稿済み実績</h2>
          <div className="space-y-4">
            {achievements.map((item) => (
              <article key={item.id} className="border border-border rounded-xl p-4">
                {editingId === item.id ? (
                  <form className="space-y-3" onSubmit={async (e) => {
                    try {
                      await onUpdateAchievement(e, item.id);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "更新に失敗しました");
                    }
                  }}>
                    <input name="title" defaultValue={item.title} className="w-full border border-input rounded-lg px-3 py-2" required />
                    <textarea name="description" defaultValue={item.description} className="w-full border border-input rounded-lg px-3 py-2 min-h-20" required />
                    <input name="location" defaultValue={item.location || ""} className="w-full border border-input rounded-lg px-3 py-2" />
                    <input name="serviceType" defaultValue={item.serviceType || ""} className="w-full border border-input rounded-lg px-3 py-2" />
                    <input name="workDate" type="date" defaultValue={item.workDate || ""} className="w-full border border-input rounded-lg px-3 py-2" />
                    <input name="duration" defaultValue={item.duration || ""} className="w-full border border-input rounded-lg px-3 py-2" />
                    <input name="scope" defaultValue={item.scope || ""} className="w-full border border-input rounded-lg px-3 py-2" />
                    <input name="displayOrder" type="number" defaultValue={item.displayOrder} className="w-full border border-input rounded-lg px-3 py-2" />
                    <textarea name="details" defaultValue={item.details || ""} className="w-full border border-input rounded-lg px-3 py-2 min-h-20" />
                    <input name="image" type="file" accept="image/*" className="w-full border border-input rounded-lg px-3 py-2" />
                    <input name="imageUrl" defaultValue={item.imageUrl || ""} className="w-full border border-input rounded-lg px-3 py-2" />
                    <label className="flex items-center gap-2 text-sm">
                      <input name="isPublished" type="checkbox" value="true" defaultChecked={item.isPublished === 1} />
                      公開する
                    </label>
                    <div className="flex gap-2">
                      <button className="bg-forest text-white rounded-lg px-4 py-2">保存</button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-input px-4 py-2">キャンセル</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.location || "-"} / {item.workDate || "日付未設定"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs rounded-full px-2 py-1 ${item.isPublished === 1 ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground"}`}>
                          {item.isPublished === 1 ? "公開中" : "下書き"}
                        </span>
                        <button onClick={() => setEditingId(item.id)} className="rounded-lg border border-input px-3 py-1 text-sm">編集</button>
                        <button
                          onClick={async () => {
                            try {
                              await onDeleteAchievement(item.id);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "削除に失敗しました");
                            }
                          }}
                          className="rounded-lg border border-destructive text-destructive px-3 py-1 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{item.description}</p>
                    {item.imageUrl ? (
                      <a href={item.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-forest underline mt-2 inline-block">画像を開く</a>
                    ) : null}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
