// backend/src/utils/time.js
export function minutes(ms) {
  return Math.floor(ms / 60000);
}

export function thresholdMinutes(menu, store) {
  // menu.prepMinutes > store.settings.sla[category] > デフォルト10
  const cat = menu?.category || "food";
  const storeSla = store?.settings?.sla || {};
  return menu?.prepMinutes || storeSla[cat] || 10;
}

export function ticketAlertColor(ticket, store, menu) {
  const th = thresholdMinutes(menu, store); // 閾値（分）
  const now = Date.now();
  const ts = ticket.timestamps || {};
  let elapsed = 0;

  if (ticket.status === "COOKING" && ts.startedAt) {
    elapsed = minutes(now - new Date(ts.startedAt).getTime());
  } else if (ticket.status === "PENDING" && ts.createdAt) {
    elapsed = minutes(now - new Date(ts.createdAt).getTime());
  } else {
    return "none";
  }

  if (elapsed >= th) return "red";
  if (elapsed >= Math.floor(th * 0.7)) return "yellow";
  return "none";
}
