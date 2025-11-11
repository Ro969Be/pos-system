import { describe, it, expect, vi } from "vitest";

vi.mock("vue-router", () => ({
  createRouter: () => ({ beforeEach: () => {} }),
  createWebHistory: () => ({}),
}));

import { hasRoleAccess, resolveRouteRoles } from "../index.js";

describe("resolveRouteRoles", () => {
  it("uses route meta when provided", () => {
    const roles = resolveRouteRoles({ meta: { requiresRole: ["Owner"] } });
    expect(roles).toEqual(["Owner"]);
  });

  it("defaults to dashboard roles when path matches", () => {
    const roles = resolveRouteRoles({ path: "/dashboard/overview", meta: {} });
    expect(roles).toContain("Admin");
    expect(roles).toContain("StoreManager");
  });
});

describe("hasRoleAccess", () => {
  const user = {
    roles: ["Admin"],
    bindings: [{ shopId: "s1", role: "StoreManager" }],
  };

  it("allows access when global role matches", () => {
    expect(hasRoleAccess(user, ["Admin"], null)).toBe(true);
  });

  it("allows access when binding matches shop", () => {
    expect(hasRoleAccess({ roles: [], bindings: user.bindings }, ["StoreManager"], "s1")).toBe(true);
  });

  it("blocks when no roles match", () => {
    expect(hasRoleAccess({ roles: [], bindings: [] }, ["Owner"], null)).toBe(
      false
    );
  });
});
