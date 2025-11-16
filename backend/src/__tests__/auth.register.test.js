import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import User from "../models/User.js";
import BusinessUser from "../models/BusinessUser.js";
import Staff from "../models/Staff.js";
import { register, login } from "../controllers/auth.controller.js";

process.env.JWT_SECRET = "test-secret";

describe("POST /api/auth/register", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers a general user and allows login", async () => {
    const findOne = jest
      .spyOn(User, "findOne")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        _id: "64b000000000000000000002",
        userName: "User A",
        email: "user@example.com",
        phone: "090",
        comparePassword: jest.fn().mockResolvedValue(true),
      });
    jest.spyOn(User, "create").mockResolvedValue({
      _id: "64b000000000000000000002",
      userName: "User A",
      email: "user@example.com",
      phone: "090",
    });
    jest.spyOn(BusinessUser, "findOne").mockReturnValue({
      lean: () => Promise.resolve(null),
    });
    jest.spyOn(Staff, "find").mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([]),
      }),
    });

    const registerRes = createRes();
    await register(
      {
        body: {
          name: "User A",
          email: "user@example.com",
          password: "pass1234",
        },
      },
      registerRes,
      jest.fn()
    );

    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.user).toMatchObject({
      id: "64b000000000000000000002",
      bindings: [],
    });
    expect(registerRes.body.user.roles).toEqual(["Customer"]);

    const decoded = jwt.verify(
      registerRes.body.token,
      process.env.JWT_SECRET
    );
    expect(decoded.userId).toBe("64b000000000000000000002");

    const loginRes = createRes();
    await login(
      { body: { email: "user@example.com", password: "pass1234" } },
      loginRes,
      jest.fn()
    );

    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.user.roles).toEqual(["Customer"]);
    expect(findOne).toHaveBeenCalledTimes(2);
  });
});

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}
