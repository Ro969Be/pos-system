// ==========================================================
// controllers/cashSessionController.js
// ==========================================================
// レジ開閉・締め（差異計算）
// - 期待現金 = openingCash + 当日現金売上（注文paymentsの現金額合計）
// - overShort = closingCash - expectedCash
// ==========================================================
const CashSession = require("../models/CashSession");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// 当日現金売上集計
async function sumCashSales(storeId, businessDate) {
  const start = new Date(
    businessDate.getFullYear(),
    businessDate.getMonth(),
    businessDate.getDate()
  );
  const end = new Date(
    businessDate.getFullYear(),
    businessDate.getMonth(),
    businessDate.getDate(),
    23,
    59,
    59,
    999
  );

  // Order.payments[].method の参照先にdisplayNameがある場合と、methodNameを直接保存している場合の両対応
  const pipeline = [
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        status: "completed",
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $unwind: "$payments" },
    // 可能なら決済マスタを参照
    {
      $lookup: {
        from: "paymentmethods",
        localField: "payments.method",
        foreignField: "_id",
        as: "methodInfo",
      },
    },
    {
      $addFields: {
        methodName: {
          $cond: [
            { $gt: [{ $size: "$methodInfo" }, 0] },
            { $arrayElemAt: ["$methodInfo.displayName", 0] },
            "$payments.methodName",
          ],
        },
      },
    },
    {
      $match: {
        methodName: { $in: ["現金", "CASH"] },
      },
    },
    {
      $group: { _id: null, cashTotal: { $sum: "$payments.amount" } },
    },
  ];

  const result = await Order.aggregate(pipeline);
  return result.length ? result[0].cashTotal : 0;
}

// レジ開始
exports.open = async (req, res) => {
  try {
    const { openingCash, openedBy, businessDate, note } = req.body;
    const biz = businessDate ? new Date(businessDate) : new Date();
    const date = new Date(biz.getFullYear(), biz.getMonth(), biz.getDate());
    const exists = await CashSession.findOne({
      storeId: req.storeId,
      businessDate: date,
      isClosed: false,
    });
    if (exists)
      return res
        .status(400)
        .json({ message: "すでに開いているレジセッションがあります" });

    const doc = await CashSession.create({
      storeId: req.storeId,
      businessDate: date,
      openingCash,
      openedBy,
      note: note || "",
      isClosed: false,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// レジ締め
exports.close = async (req, res) => {
  try {
    const { closingCash, closedBy } = req.body;
    const session = await CashSession.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!session)
      return res.status(404).json({ message: "CashSession not found" });
    if (session.isClosed)
      return res.status(400).json({ message: "既に締め済みです" });

    const cashSales = await sumCashSales(req.storeId, session.businessDate);
    const expected = Math.round((session.openingCash || 0) + cashSales);
    const overShort = Math.round(closingCash - expected);

    session.closingCash = closingCash;
    session.expectedCash = expected;
    session.overShort = overShort;
    session.closedBy = closedBy || "";
    session.isClosed = true;
    await session.save();

    res.json(session);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// 当日サマリ（フロントでのダッシュボード用）
exports.todaySummary = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const open = await CashSession.findOne({
      storeId: req.storeId,
      businessDate: start,
    });
    const cashSales = await sumCashSales(req.storeId, start);

    res.json({
      businessDate: start.toISOString().slice(0, 10),
      session: open || null,
      cashSales,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
