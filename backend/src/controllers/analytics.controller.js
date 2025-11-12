import mongoose from "mongoose";
import Order from "../models/Order.js";

function toDate(value, fallback) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export async function salesAnalytics(req, res, next) {
  try {
    const shopId = req.params.shopId;
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const from = toDate(req.query.from, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const to = toDate(req.query.to, new Date());
    const match = {
      shopId: new mongoose.Types.ObjectId(shopId),
      createdAt: { $gte: from, $lte: to },
      status: "paid",
    };
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            day: { $dateTrunc: { date: "$createdAt", unit: "day", timezone: "Asia/Tokyo" } },
            hour: { $hour: "$createdAt" },
            month: { $dateTrunc: { date: "$createdAt", unit: "month", timezone: "Asia/Tokyo" } },
          },
          total: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1, "_id.hour": 1 } },
    ];
    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function productAnalytics(req, res, next) {
  try {
    const shopId = req.params.shopId;
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const from = toDate(req.query.from, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const to = toDate(req.query.to, new Date());
    const pipeline = [
      { $match: { shopId: new mongoose.Types.ObjectId(shopId), status: "paid", createdAt: { $gte: from, $lte: to } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          qty: { $sum: "$items.qty" },
          sales: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { sales: -1 } },
    ];
    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
