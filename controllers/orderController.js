import Order from '../models/Order.js';
import Product from '../models/Product.js';

// 全注文取得（または日付指定で取得）
export const getOrders = async (req, res) => {
    try {
        const { date } = req.query;

        // 🔹日付指定がある場合、その日の予約を検索
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            const orders = await Order.find({
                reservationDate: { $gte: start, $lte: end }
            }).populate('items.product');

            return res.json({
                date,
                count: orders.length,
                orders
            });
        }

        // 🔹日付指定なし → 全件取得
        const allOrders = await Order.find().populate('items.product');
        res.json(allOrders);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 注文IDで取得
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 注文（予約）作成
export const createOrder = async (req, res) => {
    try {
        const { items, paymentMethod, amountPaid, reservationDate, customerName, customerPhone } = req.body;

        if (!reservationDate) {
            return res.status(400).json({ message: '予約日時を指定してください。' });
        }

        let totalPrice = 0;

        // 合計金額 & 在庫確認
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return res.status(404).json({ message: `商品が見つかりません: ${item.product}` });

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `在庫が足りません: ${product.name}（在庫: ${product.stock}, 必要数: ${item.quantity}）` });
            }

            const priceWithDiscount = product.price * (1 - (product.discount ?? 0) / 100);
            totalPrice += priceWithDiscount * item.quantity;
        }

        if (amountPaid < totalPrice) {
            return res.status(400).json({ message: `支払い金額が不足しています（合計: ${totalPrice}, 支払い: ${amountPaid}）` });
        }

        // 在庫を減らす
        for (const item of items) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // 注文を作成
        const order = new Order({
            items,
            totalPrice,
            paymentMethod,
            amountPaid,
            status: 'reserved',
            reservationDate: new Date(reservationDate),
            customerName,
            customerPhone,
        });

        const newOrder = await order.save();
        res.status(201).json(newOrder);

    } catch (err) {
        console.error('注文作成エラー:', err);
        res.status(500).json({ message: err.message });
    }
};
