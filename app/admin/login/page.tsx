"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "ログインに失敗しました");

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-md space-y-4">
        <h1 className="text-2xl font-bold">管理画面ログイン</h1>
        <p className="text-sm text-muted-foreground">環境変数 `ADMIN_PASSWORD` を使って認証します。</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理者パスワード"
          className="w-full border border-input rounded-lg px-3 py-2"
          required
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          disabled={loading}
          className="w-full bg-forest text-white rounded-lg px-4 py-2 disabled:opacity-60"
          type="submit"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </main>
  );
}
