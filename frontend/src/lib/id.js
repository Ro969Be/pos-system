// シンプルな一意ID（例: U-20251103-ABC123）
// 本番はバックエンドで採番する想定。ここはダミー。
export function genUserId() {
  const ymd = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `U-${ymd}-${rand}`;
}
