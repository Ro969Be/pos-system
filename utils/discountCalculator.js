// ==========================================================
// utils/discountCalculator.js
// ==========================================================
// 割引計算ロジック（クーポン・ポイント利用）
// - 定額 / 割合 / 割増対応
// ==========================================================

/**
 * 割引・割増計算
 * @param {number} basePrice 元の金額
 * @param {object[]} discounts 割引オブジェクトの配列
 * @returns {number} 割引後金額
 */
function applyDiscounts(basePrice, discounts = []) {
  let price = basePrice;

  for (const d of discounts) {
    if (!d.isActive) continue;

    if (d.type === "fixed") {
      // 定額割引 / 割増
      if (d.direction === "decrease") price -= d.value;
      else price += d.value;
    } else if (d.type === "percent") {
      // 割合割引 / 割増
      const change = (price * d.value) / 100;
      if (d.direction === "decrease") price -= change;
      else price += change;
    }
  }

  return Math.max(0, Math.round(price)); // マイナス防止
}

module.exports = { applyDiscounts };
