import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { register, registerOwner, login } from "../controllers/auth.controller.js";
import {
  addShopStaff,
  listShopStaff,
} from "../controllers/staff.controller.js";
import User from "../models/User.js";
import BusinessUser from "../models/BusinessUser.js";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import { normalizeEmail, normalizePhone } from "../utils/identifiers.js";

process.env.JWT_SECRET = "test-secret";

describe("Owner staff promotion scenario", () => {
  beforeEach(() => {
    setupModelSpies();
    jest
      .spyOn(bcrypt, "hash")
      .mockImplementation(async (value) => `hashed:${value}`);
    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(async (candidate, hashed) => hashed === `hashed:${candidate}`);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("promotes users to FullTimeStaff and PartTimeStaff and staff logins reflect bindings", async () => {
    const ownerRes = createRes();
    await registerOwner(
      {
        body: {
          name: "Owner A",
          email: "owner@example.com",
          password: "ownerpass",
          shopName: "Demo Diner",
          shopCode: "DEMO100",
        },
      },
      ownerRes,
      jest.fn()
    );

    const shopId = ownerRes.body.user.bindings[0].shopId;

    const fullTimeEmail = "fulltimer@example.com";
    const partTimeEmail = "parttimer@example.com";

    await register(
      {
        body: {
          name: "Full Timer",
          email: fullTimeEmail,
          password: "fullpass",
        },
      },
      createRes(),
      jest.fn()
    );
    await register(
      {
        body: {
          name: "Part Timer",
          email: partTimeEmail,
          password: "partpass",
        },
      },
      createRes(),
      jest.fn()
    );

    await addShopStaff(
      {
        params: { shopId },
        body: { email: fullTimeEmail, role: "FullTimeStaff" },
        user: { token: ownerRes.body.token },
      },
      createRes(),
      jest.fn()
    );

    const promotePartRes = createRes();
    await addShopStaff(
      {
        params: { shopId },
        body: { email: partTimeEmail, role: "PartTimeStaff" },
        user: { token: ownerRes.body.token },
      },
      promotePartRes,
      jest.fn()
    );

    expect(promotePartRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "Owner" }),
        expect.objectContaining({ role: "FullTimeStaff" }),
        expect.objectContaining({ role: "PartTimeStaff" }),
      ])
    );

    const listRes = createRes();
    await listShopStaff(
      {
        params: { shopId },
        user: { token: ownerRes.body.token },
      },
      listRes,
      jest.fn()
    );

    const roles = (listRes.body || []).map((row) => row.role);
    expect(roles).toEqual(
      expect.arrayContaining(["Owner", "FullTimeStaff", "PartTimeStaff"])
    );

    const fullLogin = createRes();
    await login(
      { body: { email: fullTimeEmail, password: "fullpass" } },
      fullLogin,
      jest.fn()
    );
    expect(fullLogin.body.user.roles).toContain("FullTimeStaff");
    expect(fullLogin.body.user.bindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ shopId, role: "FullTimeStaff" }),
      ])
    );

    const partLogin = createRes();
    await login(
      { body: { email: partTimeEmail, password: "partpass" } },
      partLogin,
      jest.fn()
    );
    expect(partLogin.body.user.roles).toContain("PartTimeStaff");
    expect(partLogin.body.user.bindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ shopId, role: "PartTimeStaff" }),
      ])
    );
  });
});

function setupModelSpies() {
  const state = {
    users: new Map(),
    shops: new Map(),
    businesses: new Map(),
    staff: new Map(),
    seq: 1,
  };

  const nextId = () =>
    (state.seq++).toString(16).padStart(24, "0");
  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const toIdString = (value) =>
    typeof value === "string" ? value : value?.toString?.();

  const matchUser = (user, query = {}) => {
    if (!query || !Object.keys(query).length) return true;
    if (query.$or) return query.$or.some((cond) => matchUser(user, cond));
    if (query.emailLower) return user.emailLower === query.emailLower;
    if (query.phoneNorm) return user.phoneNorm === query.phoneNorm;
    if (query._id) return String(user._id) === toIdString(query._id);
    return false;
  };

  jest.spyOn(User, "findOne").mockImplementation(async (query = {}) => {
    const match = Array.from(state.users.values()).find((user) =>
      matchUser(user, query)
    );
    if (!match) return null;
    const result = { ...match };
    result.comparePassword = (password) =>
      bcrypt.compare(password, match.passwordHash || "");
    return result;
  });

  jest.spyOn(User, "create").mockImplementation(async (payload) => {
    const _id = nextId();
    const doc = {
      _id,
      userName: payload.userName,
      email: payload.email,
      phone: payload.phone,
      passwordHash: payload.passwordHash,
      emailLower: normalizeEmail(payload.email),
      phoneNorm: normalizePhone(payload.phone),
      storeIds: [],
      shopIds: [],
    };
    state.users.set(_id, doc);
    return { ...doc };
  });

  jest.spyOn(User, "findById").mockImplementation(async (id) => {
    const doc = state.users.get(String(id));
    return doc ? { ...doc } : null;
  });

  jest
    .spyOn(User, "updateOne")
    .mockImplementation(async (filter = {}, update = {}) => {
      const target = state.users.get(String(filter._id));
      if (!target) return { matchedCount: 0, modifiedCount: 0 };
      if (update.$addToSet?.storeIds) {
        const value = toIdString(update.$addToSet.storeIds);
        if (!target.storeIds.includes(value)) target.storeIds.push(value);
      }
      if (update.$addToSet?.shopIds) {
        const value = toIdString(update.$addToSet.shopIds);
        if (!target.shopIds.includes(value)) target.shopIds.push(value);
      }
      return { matchedCount: 1, modifiedCount: 1 };
    });

  jest.spyOn(User, "find").mockImplementation((query = {}) => {
    const exec = () => {
      let docs = Array.from(state.users.values());
      if (query._id?.$in) {
        const set = new Set(query._id.$in.map((id) => String(id)));
        docs = docs.filter((doc) => set.has(String(doc._id)));
      }
      return Promise.resolve(docs.map((doc) => ({ ...doc })));
    };
    return {
      select: () => ({ lean: exec }),
      lean: exec,
    };
  });

  jest.spyOn(Store, "exists").mockImplementation(async (query = {}) => {
    if (query.code) {
      const found = Array.from(state.shops.values()).find(
        (shop) => shop.code === query.code
      );
      return found ? { _id: found._id } : null;
    }
    if (query._id) {
      const id = toIdString(query._id);
      return state.shops.has(id) ? { _id: id } : null;
    }
    return null;
  });

  jest.spyOn(Store, "create").mockImplementation(async (payload) => {
    const _id = nextId();
    const doc = {
      _id,
      shopName: payload.shopName,
      code: payload.code,
      shopKind: payload.shopKind || "Restaurant",
      ownerUserId: payload.ownerUserId,
      phone: payload.phone,
      address: payload.address,
    };
    state.shops.set(_id, doc);
    return { ...doc };
  });

  jest
    .spyOn(Store, "updateOne")
    .mockImplementation(async (filter = {}, update = {}) => {
      const id = toIdString(filter._id);
      const doc = state.shops.get(id);
      if (!doc) return { matchedCount: 0 };
      if (update.$set?.businessId) doc.businessId = update.$set.businessId;
      if (update.$set?.ownerUserId) doc.ownerUserId = update.$set.ownerUserId;
      return { matchedCount: 1 };
    });

  jest.spyOn(Store, "findById").mockImplementation((id) => ({
    lean: () => {
      const doc = state.shops.get(toIdString(id));
      return Promise.resolve(
        doc
          ? {
              _id: doc._id,
              name: doc.shopName,
              code: doc.code,
              type: doc.shopKind,
            }
          : null
      );
    },
  }));

  const matchBiz = (biz, query = {}) => {
    if (query.userId && String(biz.userId) !== toIdString(query.userId))
      return false;
    if (query.activeFlag?.$ne !== undefined) {
      if (biz.activeFlag === query.activeFlag.$ne) return false;
    }
    if (query.roleBindings?.$elemMatch?.shopId) {
      const needed = toIdString(query.roleBindings.$elemMatch.shopId);
      const ok = (biz.roleBindings || []).some(
        (binding) => String(binding.shopId) === needed
      );
      if (!ok) return false;
    }
    return true;
  };

  jest.spyOn(BusinessUser, "create").mockImplementation(async (payload) => {
    const _id = nextId();
    const doc = {
      _id,
      userId: String(payload.userId),
      businessName: payload.businessName,
      role: payload.role,
      roleBindings: (payload.roleBindings || []).map((b) => ({
        shopId: toIdString(b.shopId),
        role: b.role,
      })),
      shopIds: (payload.shopIds || []).map((id) => toIdString(id)),
      activeFlag: payload.activeFlag !== false,
    };
    state.businesses.set(doc.userId, doc);
    return { ...doc };
  });

  jest.spyOn(BusinessUser, "findOne").mockImplementation((query = {}) => ({
    lean: () => {
      const match = Array.from(state.businesses.values()).find((biz) =>
        matchBiz(biz, query)
      );
      return Promise.resolve(match ? clone(match) : null);
    },
  }));

  jest.spyOn(BusinessUser, "find").mockImplementation((query = {}) => ({
    lean: () => {
      const docs = Array.from(state.businesses.values()).filter((biz) =>
        matchBiz(biz, query)
      );
      return Promise.resolve(docs.map((doc) => clone(doc)));
    },
  }));

  jest
    .spyOn(BusinessUser, "findOneAndUpdate")
    .mockImplementation(async (filter = {}, update = {}, options = {}) => {
      const userId = String(filter.userId);
      let doc = state.businesses.get(userId);
      if (!doc && options.upsert) {
        doc = {
          _id: nextId(),
          userId,
          businessName: update.$setOnInsert?.businessName || "",
          role: update.$setOnInsert?.role || "FullTimeStaff",
          roleBindings: [],
          shopIds: [],
          activeFlag: true,
        };
      }
      if (!doc) return null;
      if (update.$set?.activeFlag !== undefined) {
        doc.activeFlag = update.$set.activeFlag;
      }
      const targetShop = options.arrayFilters?.[0]?.["target.shopId"] ?? null;
      if (update.$set?.["roleBindings.$[target].role"] && targetShop) {
        const binding = doc.roleBindings.find(
          (b) => String(b.shopId) === toIdString(targetShop)
        );
        if (binding) {
          binding.role = update.$set["roleBindings.$[target].role"];
        }
      }
      if (update.$addToSet?.roleBindings) {
        const binding = update.$addToSet.roleBindings;
        const exists = doc.roleBindings.some(
          (b) => String(b.shopId) === toIdString(binding.shopId)
        );
        if (!exists) {
          doc.roleBindings.push({
            shopId: toIdString(binding.shopId),
            role: binding.role,
          });
        }
      }
      if (update.$addToSet?.shopIds) {
        const value = toIdString(update.$addToSet.shopIds);
        if (!doc.shopIds.some((id) => id === value)) {
          doc.shopIds.push(value);
        }
      }
      state.businesses.set(userId, doc);
      return { ...doc };
    });

  const matchStaff = (row, query = {}) => {
    return Object.entries(query).every(([key, value]) => {
      if (key === "storeId") return String(row.storeId) === toIdString(value);
      if (key === "userId") return String(row.userId) === toIdString(value);
      if (key === "activeFlag" && value?.$ne !== undefined) {
        return row.activeFlag !== value.$ne;
      }
      if (key === "activeFlag") return row.activeFlag === value;
      return true;
    });
  };

  jest.spyOn(Staff, "find").mockImplementation((query = {}) => {
    const exec = () => {
      const docs = Array.from(state.staff.values())
        .filter((doc) => matchStaff(doc, query))
        .map((doc) => ({ ...doc }));
      return Promise.resolve(docs);
    };
    return {
      select: () => ({ lean: exec }),
      lean: exec,
    };
  });

  jest
    .spyOn(Staff, "findOneAndUpdate")
    .mockImplementation(async (filter = {}, update = {}, options = {}) => {
      const storeId = toIdString(filter.storeId);
      const userId = toIdString(filter.userId);
      const key = `${storeId}:${userId}`;
      let doc = state.staff.get(key);
      if (!doc && options.upsert) {
        doc = {
          _id: nextId(),
          storeId,
          userId,
          role: "FullTimeStaff",
          displayName: "",
          accountName: "",
          activeFlag: true,
        };
      }
      if (!doc) return null;
      if (update.$setOnInsert) {
        doc = { ...doc, ...update.$setOnInsert };
      }
      if (update.$set) {
        doc = { ...doc, ...update.$set };
      }
      state.staff.set(key, doc);
      return { ...doc };
    });

  return state;
}

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
