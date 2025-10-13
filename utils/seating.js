// ==========================================================
// utils/seating.js
// ==========================================================
// 自動配席アルゴリズム
// - 与えられたテーブル一覧の中から、合計 capacity が partySize を満たす
//   最小空席ロスの組み合わせを探索（貪欲 + 改善）
// - 席の状態(status)が vacant のものだけ対象
// ==========================================================

/**
 * 自動配席
 * @param {Array<{_id:any, capacity:number, status:string}>} tables
 * @param {number} partySize
 * @returns {string[]} 選択した table._id の配列
 */
function autoAssignTables(tables, partySize) {
  // vacant のみ
  const candidates = tables
    .filter((t) => t.status === "vacant")
    .sort((a, b) => b.capacity - a.capacity);

  let selected = [];
  let sum = 0;

  // まずは大きい席から貪欲に
  for (const t of candidates) {
    if (sum >= partySize) break;
    selected.push(t);
    sum += t.capacity;
  }

  // もし満たない場合は失敗
  if (sum < partySize) return [];

  // 簡易改善（最後の1席をより小さい席に置き換えてロスを削減）
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < selected.length; i++) {
      const without = selected.filter((_, idx) => idx !== i);
      const withoutSum = without.reduce((s, t) => s + t.capacity, 0);
      // 置き換え候補を探す
      const replace = candidates.find(
        (c) =>
          !without.some((w) => String(w._id) === String(c._id)) &&
          withoutSum + c.capacity >= partySize &&
          c.capacity < selected[i].capacity
      );
      if (replace) {
        selected = [...without, replace];
        improved = true;
        break;
      }
    }
  }

  return selected.map((s) => s._id);
}

module.exports = { autoAssignTables };
