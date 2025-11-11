// backend/src/utils/roles.js

export const ROLE_VALUES = [
  "Admin",
  "Owner",
  "AreaManager",
  "StoreManager",
  "AssistantManager",
  "Employee",
  "PartTime",
];

const LEGACY_TO_CANONICAL = {
  admin: "Admin",
  owner: "Owner",
  area_manager: "AreaManager",
  store_manager: "StoreManager",
  assistant_manager: "AssistantManager",
  employee: "Employee",
  staff: "Employee",
  part_time: "PartTime",
  manager: "StoreManager",
};

const CANONICAL_TO_LEGACY = {
  Admin: "admin",
  Owner: "owner",
  AreaManager: "area_manager",
  StoreManager: "store_manager",
  AssistantManager: "assistant_manager",
  Employee: "employee",
  PartTime: "part_time",
};

/**
 * Convert provided role into canonical DB design name.
 */
export function canonicalRole(role) {
  if (!role) return null;
  if (ROLE_VALUES.includes(role)) return role;
  return LEGACY_TO_CANONICAL[role] || null;
}

/**
 * Convert canonical role into legacy snake_case value.
 */
export function legacyRole(role) {
  if (!role) return null;
  if (role in CANONICAL_TO_LEGACY) return CANONICAL_TO_LEGACY[role];
  if (LEGACY_TO_CANONICAL[role]) return role;
  return role;
}

export function roleRank(role) {
  const canonical = canonicalRole(role) || role;
  const ranks = {
    Admin: 6,
    Owner: 5,
    AreaManager: 4,
    StoreManager: 3,
    AssistantManager: 2,
    Employee: 1,
    PartTime: 0,
  };
  return ranks[canonical] ?? ranks[role] ?? -1;
}

export function hasRequiredRole(userRoles = [], bindings = [], required, shopId) {
  if (!required) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  const canonicalRequired = requiredList
    .map((r) => canonicalRole(r) || r)
    .filter(Boolean);

  const hasGlobal = (userRoles || []).some((role) =>
    canonicalRequired.includes(canonicalRole(role) || role)
  );
  if (hasGlobal) return true;

  if (!shopId) return false;
  return (bindings || []).some(
    (binding) =>
      String(binding.shopId) === String(shopId) &&
      canonicalRequired.includes(canonicalRole(binding.role) || binding.role)
  );
}
