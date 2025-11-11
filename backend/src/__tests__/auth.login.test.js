import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import authRoutes from "../routes/auth.routes.js";
import User from "../models/User.js";
import BusinessUser from "../models/BusinessUser.js";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth & RBAC login", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns JWT with roles/bindings on successful login", async () => {
    const comparePassword = jest.fn().mockResolvedValue(true);
    jest.spyOn(User, "findOne").mockResolvedValue({
      _id: "64b000000000000000000001",
      userName: "Demo Admin",
      email: "admin@example.com",
      phone: "0100",
      comparePassword,
    });
    jest.spyOn(BusinessUser, "findOne").mockReturnValue({
      lean: () =>
        Promise.resolve({
          _id: "b1",
          businessName: "Demo Holdings",
          role: "Owner",
          roleBindings: [{ shopId: "s1", role: "Owner" }],
        }),
    });
    jest.spyOn(Staff, "find").mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve([
            {
              _id: "staff1",
              storeId: "s1",
              role: "Admin",
              employmentType: "FullTime",
              activeFlag: true,
            },
          ]),
      }),
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "secret" })
      .expect(200);

    expect(comparePassword).toHaveBeenCalled();
    expect(res.body.token).toBeTruthy();
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.roles).toEqual(expect.arrayContaining(["Owner", "Admin"]));
    expect(decoded.bindings[0]).toMatchObject({ shopId: "s1", role: "Owner" });
  });

  it("rejects invalid passwords", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "wrong" })
      .expect(401);
  });
});

describe("GET /api/auth/me", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns current user profile", async () => {
    jest.spyOn(User, "findById").mockReturnValue({
      lean: () =>
        Promise.resolve({
          _id: "64b000000000000000000001",
          userName: "Demo Admin",
          email: "admin@example.com",
          phone: "0100",
        }),
    });
    jest.spyOn(BusinessUser, "findOne").mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve(null),
      }),
    });
    jest.spyOn(Store, "findById").mockReturnValue({
      lean: () =>
        Promise.resolve({
          _id: "s1",
          name: "Dev Shop",
          code: "DEV-001",
          type: "restaurant",
        }),
    });

    const token = jwt.sign(
      {
        userId: "64b000000000000000000001",
        roles: ["Admin"],
        bindings: [{ shopId: "s1", role: "Admin" }],
        storeId: "s1",
      },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.userName).toBe("Demo Admin");
    expect(res.body.permissions).toEqual(
      expect.arrayContaining(["kitchen.view", "pos.view"])
    );
    expect(res.body.shop).toMatchObject({ code: "DEV-001" });
  });
});
