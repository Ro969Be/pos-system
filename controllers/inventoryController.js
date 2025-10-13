const InventoryAudit = require("../models/InventoryAudit");

exports.recordAudit = async (req, res) => {
  try {
    const { productId, expectedQty, actualQty, cost, price, memo } = req.body;
    const diff = actualQty - expectedQty;
    const audit = await InventoryAudit.create({
      storeId: req.storeId,
      productId,
      expectedQty,
      actualQty,
      diff,
      cost,
      price,
      memo,
      recordedBy: req.user.name,
    });
    res.status(201).json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
