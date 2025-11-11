import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import shopsRouter from "../routes/shops.routes.js";
import Shop from "../models/Shop.js";
import Table from "../models/Table.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops", shopsRouter);

function authHeader(payload = {}) {
  const token = jwt.sign(
    {
      userId: "user-1",
      roles: payload.roles || ["Admin"],
      bindings: payload.bindings || [],
      storeId: payload.storeId,
    },
    process.env.JWT_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

describe("Shops & Tables API", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lists shops for allowed bindings", async () => {
    const lean = jest.fn().mockResolvedValue([{ _id: "s1", shopName: "Demo" }]);
    const sort = jest.fn().mockReturnValue({ lean });
    const find = jest.spyOn(Shop, "find").mockReturnValue({ sort });

    await request(app)
      .get("/api/shops")
      .set(
        authHeader({
          roles: ["Owner"],
          bindings: [{ shopId: "507f1f77bcf86cd799439011", role: "Owner" }],
        })
      )
      .expect(200);

    expect(find).toHaveBeenCalled();
    const filter = find.mock.calls[0][0];
    expect(filter.activeFlag).toEqual({ $ne: false });
  });

  it("creates a shop", async () => {
    const mockShop = { _id: "s2", shopName: "New Shop" };
    const create = jest.spyOn(Shop, "create").mockResolvedValue(mockShop);

    const res = await request(app)
      .post("/api/shops")
      .set(authHeader({ roles: ["Admin"] }))
      .send({ shopName: "New Shop", shopKind: "Restaurant" })
      .expect(201);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ shopName: "New Shop" })
    );
    expect(res.body.shopName).toBe("New Shop");
  });

  it("creates a table under a shop", async () => {
    const tableCreate = jest
      .spyOn(Table, "create")
      .mockResolvedValue({ _id: "t1", tableName: "A1" });

    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/tables")
      .set(authHeader({ roles: ["Admin"] }))
      .send({ tableName: "A1", capacity: 4 })
      .expect(201);

    expect(tableCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tableName: "A1",
        capacity: 4,
        shopId: "507f1f77bcf86cd799439011",
      })
    );
  });

  it("locks and unlocks a table with TTL", async () => {
    const save = jest.fn().mockResolvedValue(true);
    const tableDoc = {
      _id: "t1",
      lock: null,
      save,
    };
    jest
      .spyOn(Table, "findOne")
      .mockResolvedValueOnce(tableDoc) // lock request
      .mockResolvedValueOnce(tableDoc); // unlock request

    const lockRes = await request(app)
      .patch("/api/shops/507f1f77bcf86cd799439011/tables/t1/lock")
      .set(authHeader({ roles: ["StoreManager"] }))
      .send({ action: "lock", holdMinutes: 10 })
      .expect(200);

    expect(lockRes.body.ok).toBe(true);
    expect(tableDoc.lock).toBeDefined();

    const unlockRes = await request(app)
      .patch("/api/shops/507f1f77bcf86cd799439011/tables/t1/lock")
      .set(authHeader({ roles: ["StoreManager"] }))
      .send({ action: "unlock" })
      .expect(200);

    expect(unlockRes.body.ok).toBe(true);
  });
});
