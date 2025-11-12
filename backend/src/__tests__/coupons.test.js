import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import shopCouponsRouter from "../routes/shopCoupons.routes.js";
import Coupon from "../models/Coupon.js";
import CouponRedemption from "../models/CouponRedemption.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/coupons", shopCouponsRouter);

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

describe("Coupons API", () => {
  afterEach(() => jest.restoreAllMocks());

  it("issues redemption with days-after-acquire rule", async () => {
    jest.spyOn(Coupon, "findOne").mockResolvedValue({
      _id: "507f1f77bcf86cd7994390c1",
      shopId: "507f1f77bcf86cd799439011",
      activeFlag: true,
      validDaysAfterAcquire: 3,
      redeemedCount: 0,
      maxRedemptions: 5,
    });
    jest.spyOn(CouponRedemption, "create").mockImplementation(async (payload) => payload);

    const res = await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/coupons/507f1f77bcf86cd7994390c1/redemptions")
      .set(authHeader())
      .expect(201);

    expect(res.body.expiresAt).toBeDefined();
  });

  it("prevents using expired redemption", async () => {
    jest.spyOn(CouponRedemption, "findOne").mockResolvedValue({
      _id: "507f1f77bcf86cd7994390c2",
      couponId: "507f1f77bcf86cd7994390c1",
      shopId: "507f1f77bcf86cd799439011",
      status: "issued",
      expiresAt: new Date(Date.now() - 60 * 1000),
    });

    await request(app)
      .patch("/api/shops/507f1f77bcf86cd799439011/coupons/507f1f77bcf86cd7994390c1/redemptions/507f1f77bcf86cd7994390c2/use")
      .set(authHeader())
      .expect(409);
  });
});

