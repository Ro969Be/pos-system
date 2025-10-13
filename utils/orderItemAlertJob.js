// utils/orderItemAlertJob.js
// =====================================================
// 定期ジョブ: 提供時間を超過した注文を強調表示する
// =====================================================
const OrderItem = require("../models/OrderItem");

async function checkOverTime(io) {
  const now = new Date();
  const items = await OrderItem.find({ status: { $ne: "served" } });
  for (const item of items) {
    const elapsed = (now - new Date(item.createdAt)) / 60000;
    if (elapsed > item.provideTime) {
      io.emit("orderItemOverSLA", {
        id: item._id,
        elapsed,
        provideTime: item.provideTime,
      });
    }
  }
}

module.exports = function startOrderItemAlertJob(io) {
  console.log("⏰ OrderItem Alert Job started");
  setInterval(() => checkOverTime(io), 60 * 1000);
};
