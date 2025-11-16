import { jest } from "@jest/globals";
import User from "../models/User.js";
import BusinessUser from "../models/BusinessUser.js";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import { registerOwner } from "../controllers/auth.controller.js";

process.env.JWT_SECRET = "test-secret";

describe("POST /api/auth/register-owner", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates owner with binding to the new shop", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User, "create").mockResolvedValue({
      _id: "64b000000000000000000010",
      userName: "Owner One",
      email: "owner@example.com",
      phone: "080",
    });
    jest.spyOn(Store, "exists").mockResolvedValue(null);
    const shopDoc = {
      _id: "64b000000000000000000099",
      shopName: "Demo Shop",
      code: "SHOP100",
      shopKind: "Restaurant",
      ownerUserId: "64b000000000000000000010",
    };
    jest.spyOn(Store, "create").mockResolvedValue(shopDoc);
    jest.spyOn(Store, "updateOne").mockResolvedValue({ acknowledged: true });
    jest.spyOn(User, "updateOne").mockResolvedValue({ acknowledged: true });
    jest.spyOn(Store, "findById").mockReturnValue({
      lean: () =>
        Promise.resolve({
          _id: shopDoc._id,
          name: shopDoc.shopName,
          code: shopDoc.code,
          type: shopDoc.shopKind,
        }),
    });
    const bizDoc = {
      _id: "biz-1",
      businessName: "Demo Shop",
      role: "Owner",
      roleBindings: [{ shopId: shopDoc._id, role: "Owner" }],
    };
    jest.spyOn(BusinessUser, "create").mockResolvedValue(bizDoc);
    jest.spyOn(BusinessUser, "findOne").mockReturnValue({
      lean: () =>
        Promise.resolve({
          ...bizDoc,
          userId: "64b000000000000000000010",
        }),
    });
    jest.spyOn(Staff, "find").mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([]),
      }),
    });

    const res = createRes();
    await registerOwner(
      {
        body: {
          name: "Owner One",
          email: "owner@example.com",
          password: "pass1234",
          shopName: "Demo Shop",
          shopCode: "SHOP100",
        },
      },
      res,
      jest.fn()
    );

    expect(res.body.user.roles).toContain("Owner");
    expect(res.body.user.bindings[0]).toMatchObject({
      shopId: shopDoc._id,
      role: "Owner",
    });
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
