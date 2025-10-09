const Order = require("../models/Order");
const Product = require("../models/Product");
const PaymentMethod = require("../models/PaymentMethod");

const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// 全注文取得（または日付指定で取得）
const getOrders = async (req, res) => {
  try {
    const { date } = req.query;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const orders = await Order.find({
        reservationDate: { $gte: start, $lte: end },
      }).populate("items.product");

      return res.json({
        date,
        count: orders.length,
        orders,
      });
    }

    const allOrders = await Order.find().populate("items.product");
    res.json(allOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 注文IDで取得
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 注文（予約）作成
const createOrder = async (req, res) => {
  try {
    const { items, payments, reservationDate, customerName, customerPhone } = req.body;

    if (!reservationDate) {
      return res.status(400).json({ message: "予約日時を指定してください。" });
    }

    // 合計金額計算
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `商品が見つかりません: ${item.product}` });

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `在庫不足: ${product.name}` });
      }

      const priceWithDiscount = product.price * (1 - (product.discount ?? 0) / 100);
      totalPrice += priceWithDiscount * item.quantity;
    }

    // 支払合計
    let paidSum = 0;
    let cashPayment = null;

    for (const p of payments) {
      const method = await PaymentMethod.findById(p.method);
      if (!method) return res.status(400).json({ message: `支払い方法が無効です: ${p.method}` });

      paidSum += p.amount;

      if (method.name.toLowerCase() === "cash") {
        cashPayment = p; // 現金を特定
      }
    }

    if (paidSum < totalPrice) {
      return res.status(400).json({ message: `支払い不足: 合計 ${totalPrice}, 支払額 ${paidSum}` });
    }

    if (paidSum > totalPrice) {
      const overpay = paidSum - totalPrice;

      if (!cashPayment) {
        return res.status(400).json({ message: `現金以外は過剰支払いできません。合計 ${totalPrice}, 支払額 ${paidSum}` });
      }

      if (cashPayment.amount < overpay) {
        return res.status(400).json({ message: `お釣り ${overpay} を現金で吸収できません。現金支払額: ${cashPayment.amount}` });
      }

      cashPayment.amount -= overpay;
      paidSum = totalPrice;
    }

    // 在庫減少
    for (const item of items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      items,
      payments,
      totalPrice,
      status: "reserved",
      reservationDate: new Date(reservationDate),
      customerName,
      customerPhone,
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("注文作成エラー:", err);
    res.status(500).json({ message: err.message });
  }
};

// 注文（予約）削除
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "completed") {
      return res.status(400).json({ message: "Completed order cannot be cancelled" });
    }

    // 在庫を戻す
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      product.stock += item.quantity;
      await product.save();
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 売上・予約レポート
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const dailyReservations = await Order.aggregate([
      { $match: { reservationDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reservationDate" } },
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bestSellers = await Order.aggregate([
      { $match: { reservationDate: { $gte: start, $lte: end }, status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
    ]);

    res.json({ dailyReservations, bestSellers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CSV出力
const exportSalesReportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const orders = await Order.find({
      reservationDate: { $gte: start, $lte: end },
      status: "completed",
    }).populate("items.product customer");

    const data = orders.map((o) => ({
      date: o.reservationDate.toISOString().split("T")[0],
      totalPrice: o.totalPrice,
      paymentMethod: o.paymentMethod,
      customer: o.customer?.name || o.customerName || "N/A",
      items: o.items.map((i) => `${i.product?.name} x${i.quantity}`).join("; "),
    }));

    const parser = new Parser({ fields: ["date", "totalPrice", "paymentMethod", "customer", "items"] });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`sales_report_${startDate}_${endDate}.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PDF出力
const exportSalesReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, type = "list" } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const orders = await Order.find({
      reservationDate: { $gte: start, $lte: end },
      status: "completed",
    }).populate("items.product customer");

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Disposition", `attachment; filename="sales_report_${type}_${startDate}_${endDate}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("売上レポート", { align: "center" });
    doc.fontSize(12).text(`期間: ${startDate} ～ ${endDate}`, { align: "center" });
    doc.moveDown(2);

    if (type === "list") {
      orders.forEach((order) => {
        doc.fontSize(12).text(`日付: ${order.reservationDate.toISOString().split("T")[0]}`);
        doc.text(`顧客: ${order.customer?.name || order.customerName || "N/A"}`);
        doc.text(`合計金額: ¥${order.totalPrice}`);
        doc.text(`支払方法: ${order.paymentMethod}`);
        doc.text(`ステータス: ${order.status}`);
        doc.text("注文詳細:");
        order.items.forEach((i) => {
          doc.text(`  - ${i.product?.name} x${i.quantity}`);
        });
        doc.moveDown();
      });
    } else if (type === "summary") {
      const summary = {};
      orders.forEach((order) => {
        const date = order.reservationDate.toISOString().split("T")[0];
        if (!summary[date]) {
          summary[date] = { totalSales: 0, totalOrders: 0 };
        }
        summary[date].totalSales += order.totalPrice;
        summary[date].totalOrders += 1;
      });

      doc.fontSize(14).text("日次集計", { underline: true });
      doc.moveDown();

      Object.entries(summary).forEach(([date, stats]) => {
        doc.fontSize(12).text(`${date} - 件数: ${stats.totalOrders}, 売上合計: ¥${stats.totalSales}`);
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getSalesReport,
  exportSalesReportCSV,
  exportSalesReportPDF,
};
