import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import ordersRouter from "../routes/orders.routes.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Refund from "../models/Refund.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/orders", ordersRouter);

function authHeader() {
  const token = jwt.sign(
    {
      userId: "user-1",
      storeId: "507f1f77bcf86cd799439011",
      roles: ["Admin"],
    },
    process.env.JWT_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

describe("Order Payments", () => {
  afterEach(() => jest.restoreAllMocks());

  it("rejects card overpayment", async () => {
    const orderId = "507f1f77bcf86cd7994390a1";
    jest.spyOn(Order, "findById").mockResolvedValue({
      _id: orderId,
      shopId: "507f1f77bcf86cd799439011",
      storeId: "507f1f77bcf86cd799439011",
      status: "open",
      total: 1000,
      paymentSummary: { paidTotal: 0, changeDue: 0 },
      save: jest.fn(),
    });
    jest.spyOn(Payment, "aggregate").mockResolvedValue([{ total: 0 }]);
    jest.spyOn(Refund, "aggregate").mockResolvedValue([{ total: 0 }]);

    const res = await request(app)
      .post(`/api/orders/${orderId}/payments`)
      .set(authHeader())
      .send({ amount: 1200, method: "Card" })
      .expect(400);

    expect(res.body.validationRule).toBe("excess-NG");
  });

  it("accepts cash overpayment with change", async () => {
    const orderId = "507f1f77bcf86cd7994390a2";
    const save = jest.fn().mockResolvedValue(true);
    jest.spyOn(Order, "findById").mockResolvedValue({
      _id: orderId,
      shopId: "507f1f77bcf86cd799439011",
      storeId: "507f1f77bcf86cd799439011",
      status: "open",
      total: 1000,
      paymentSummary: { paidTotal: 0, changeDue: 0 },
      save,
    });
    jest.spyOn(Payment, "aggregate").mockResolvedValue([{ total: 0 }]);
    jest.spyOn(Refund, "aggregate").mockResolvedValue([{ total: 0 }]);
    const paymentCreate = jest.spyOn(Payment, "create").mockResolvedValue({ _id: "pay1" });

    const res = await request(app)
      .post(`/api/orders/${orderId}/payments`)
      .set(authHeader())
      .send({ amount: 1200, method: "Cash" })
      .expect(201);

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({ validationRule: "excess-cash-OK", change: 200 })
    );
    expect(res.body.validationRule).toBe("excess-cash-OK");
    expect(res.body.change).toBe(200);
  });
});
