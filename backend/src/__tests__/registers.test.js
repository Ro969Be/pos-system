import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import shopRegistersRouter from "../routes/shopRegisters.routes.js";
import Register from "../models/Register.js";
import RegisterSession from "../models/RegisterSession.js";
import RegisterHistory from "../models/RegisterHistory.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/registers", shopRegistersRouter);

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

describe("Registers & Sessions", () => {
  afterEach(() => jest.restoreAllMocks());

  it("opens and closes a session with diff calculation", async () => {
    const registerId = "507f1f77bcf86cd7994390d1";
    const sessionId = "507f1f77bcf86cd7994390d2";

    jest
      .spyOn(Register, "findOne")
      .mockResolvedValue({ _id: registerId, shopId: "507f1f77bcf86cd799439011" });
    jest.spyOn(RegisterSession, "findOne").mockResolvedValueOnce(null);
    const createSession = jest
      .spyOn(RegisterSession, "create")
      .mockResolvedValue({ _id: "sess1", expectedCash: 500 });

    await request(app)
      .post(`/api/shops/507f1f77bcf86cd799439011/registers/${registerId}/session`)
      .set(authHeader())
      .send({ openingAmount: 500 })
      .expect(201);

    expect(createSession).toHaveBeenCalled();

    const save = jest.fn().mockResolvedValue(true);
    jest.spyOn(RegisterSession, "findOne").mockResolvedValue({
      _id: sessionId,
      shopId: "507f1f77bcf86cd799439011",
      registerId,
      status: "open",
      openingAmount: 500,
      expectedCash: 600,
      save,
      approvals: {},
    });
    jest.spyOn(RegisterHistory, "create").mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/shops/507f1f77bcf86cd799439011/registers/${registerId}/session/${sessionId}/close`)
      .set(authHeader())
      .send({ closingAmount: 580 })
      .expect(200);

    expect(res.body.diffAmount).toBe(-20);
    expect(res.body.approvals.required).toBe(true);
  });
});
