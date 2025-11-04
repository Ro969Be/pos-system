export const catalog = [
  { id: "m-100", name: "生ビール", price: 600, category: "ドリンク" },
  { id: "m-101", name: "ハイボール", price: 550, category: "ドリンク" },
  { id: "m-200", name: "唐揚げ", price: 680, category: "フード" },
  { id: "m-201", name: "ポテト", price: 480, category: "フード" },
  { id: "m-202", name: "サラダ", price: 520, category: "フード" },
];

export function subtotal(lines) {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}
export function tax(amount, rate = 0.1) {
  return Math.round(amount * rate);
}
export function total(amount, taxAmount) {
  return amount + taxAmount;
}
