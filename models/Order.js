import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'e-money'], required: true },
    amountPaid: { type: Number, required: true },
    status: { type: String, enum: ['reserved', 'completed', 'cancelled'], default: 'reserved' },
    reservationDate: { type: Date, required: true }, // 🔹予約日時
    customerName: { type: String },
    customerPhone: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
