import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import shopKdsRouter from "../routes/shopKds.routes.js";
import kdsRouter from "../routes/kds.routes.js";
import KdsTicket from "../models/KdsTicket.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/kds", shopKdsRouter);
app.use("/api/kds", kdsRouter);

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

describe("KDS API", () => {
  afterEach(() => jest.restoreAllMocks());

  it("lists tickets filtered by station and sorts by priority", async () => {
    const sortMock = jest
      .fn()
      .mockReturnValue({ lean: () => Promise.resolve([]) });
    jest.spyOn(KdsTicket, "find").mockReturnValue({ sort: sortMock });

    await request(app)
      .get("/api/shops/507f1f77bcf86cd799439011/kds?station=Kitchen")
      .set(authHeader())
      .expect(200);

    expect(sortMock).toHaveBeenCalledWith({ priority: -1, createdAt: 1 });
  });

  it("transitions start/ready/serve states", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const startId = "507f1f77bcf86cd7994390b1";
    const serveId = "507f1f77bcf86cd7994390b2";
    jest.spyOn(KdsTicket, "findById").mockImplementation((id) => {
      if (id === startId) {
        return Promise.resolve({
          _id: id,
          storeId: "507f1f77bcf86cd799439011",
          status: "new",
          timestamps: {},
          save,
        });
      }
      if (id === serveId) {
        return Promise.resolve({
          _id: id,
          storeId: "507f1f77bcf86cd799439011",
          status: "ready",
          timestamps: {},
          save,
        });
      }
      return Promise.resolve(null);
    });

    await request(app)
      .patch(`/api/kds/${startId}/start`)
      .set(authHeader())
      .expect(200);
    expect(save).toHaveBeenCalled();

    await request(app)
      .patch(`/api/kds/${serveId}/serve`)
      .set(authHeader())
      .expect(200);
  });

  it("records revert history", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const revertId = "507f1f77bcf86cd7994390b3";
    const ticket = {
      _id: revertId,
      storeId: "507f1f77bcf86cd799439011",
      status: "ready",
      timestamps: {},
      revertHistory: [],
      save,
    };
    jest.spyOn(KdsTicket, "findById").mockResolvedValue(ticket);

    const res = await request(app)
      .patch(`/api/kds/${revertId}/revert`)
      .set(authHeader())
      .send({ to: "new", reason: "Test" })
      .expect(200);

    expect(res.body.status).toBe("new");
    expect(ticket.revertHistory.length).toBe(1);
  });
});
