import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-3xl font-bold mb-3">ページが見つかりません</h1>
        <p className="text-muted-foreground mb-6">URLが変更されたか、削除された可能性があります。</p>
        <Link href="/" className="inline-flex items-center rounded-lg bg-forest text-white px-4 py-2">
          トップページへ戻る
        </Link>
      </div>
    </main>
  );
}
