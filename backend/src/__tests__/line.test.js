import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import shopLineRouter from "../routes/shopLine.routes.js";
import LineBroadcast from "../models/LineBroadcast.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/line/broadcasts", shopLineRouter);

function authHeader() {
  const token = jwt.sign(
    { userId: "user-1", storeId: "507f1f77bcf86cd799439011", roles: ["Admin"] },
    process.env.JWT_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

describe("LINE Broadcasts", () => {
  afterEach(() => jest.restoreAllMocks());

  it("creates and sends a broadcast", async () => {
    jest.spyOn(LineBroadcast, "find").mockReturnValue({ sort: () => ({ lean: () => Promise.resolve([]) }) });
    const create = jest.spyOn(LineBroadcast, "create").mockResolvedValue({ _id: "b1" });
    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/line/broadcasts")
      .set(authHeader())
      .send({ title: "Campaign", body: "Hi!", scheduledAt: "2025-01-01T10:00:00.000Z" })
      .expect(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ scheduledAt: "2025-01-01T10:00:00.000Z" })
    );

    const save = jest.fn().mockResolvedValue(true);
    jest.spyOn(LineBroadcast, "findOne").mockResolvedValue({
      _id: "b1",
      shopId: "507f1f77bcf86cd799439011",
      status: "draft",
      save,
      stats: {},
    });

    const res = await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/line/broadcasts/b1/send")
      .set(authHeader())
      .expect(200);

    expect(res.body.status).toBe("sent");
    expect(save).toHaveBeenCalled();
  });
});
