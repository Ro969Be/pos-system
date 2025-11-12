/** 会計ルールの検証。仕様 根拠: 機能一覧の会計ルール表。 */
export function validatePayments(total, payments) {
  const sum = payments.reduce((a, p) => a + (p.amount || 0), 0);

  // sum < total → エラー（不足）
  if (sum < total)
    return {
      ok: false,
      code: "UNDERPAY",
      message: "支払い合計が不足しています。",
    }; // :contentReference[oaicite:12]{index=12}

  // sum === total → OK
  if (sum === total) return { ok: true };

  // sum > total の場合、現金が含まれていれば釣銭処理OK、現金無しはNG
  const cash = payments.find((p) => p.method === "cash")?.amount || 0;
  if (cash <= 0)
    return {
      ok: false,
      code: "OVERPAY_NO_CASH",
      message: "現金を含まない過剰支払いは不可です。",
    }; // :contentReference[oaicite:13]{index=13}

  // お釣り > 現金支払い額 → エラー
  const change = sum - total;
  if (change > cash)
    return {
      ok: false,
      code: "CHANGE_EXCEEDS_CASH",
      message: "お釣りが現金額を超えています。",
    }; // :contentReference[oaicite:14]{index=14}

  return { ok: true, change };
}
