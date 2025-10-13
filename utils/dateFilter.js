// ==========================================================
// utils/dateFilter.js
// ==========================================================
// あなたの buildDateFilter() をベースに拡張
// - period: daily / weekly / monthly / yearly / custom
// - startDate, endDate: 任意指定
// ==========================================================
const moment = require("moment");

function buildDateFilter(period, startDate, endDate, field = "createdAt") {
  const match = {};
  const now = moment();

  switch (period) {
    case "daily":
      match[field] = {
        $gte: now.clone().startOf("day").toDate(),
        $lte: now.clone().endOf("day").toDate(),
      };
      break;
    case "weekly":
      match[field] = {
        $gte: now.clone().startOf("week").toDate(),
        $lte: now.clone().endOf("week").toDate(),
      };
      break;
    case "monthly":
      match[field] = {
        $gte: now.clone().startOf("month").toDate(),
        $lte: now.clone().endOf("month").toDate(),
      };
      break;
    case "yearly":
      match[field] = {
        $gte: now.clone().startOf("year").toDate(),
        $lte: now.clone().endOf("year").toDate(),
      };
      break;
    case "custom":
      if (startDate && endDate) {
        match[field] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      break;
    default:
      // 全期間
      match[field] = { $exists: true };
      break;
  }
  return match;
}

module.exports = { buildDateFilter };
