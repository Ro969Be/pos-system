// backend/src/utils/roles.js

export const ROLE_VALUES = [
  "Admin",
  "Owner",
  "AreaManager",
  "StoreManager",
  "SubManager",
  "FullTimeStaff",
  "PartTimeStaff",
  "Customer",
  "PublicCustomer",
];

const LEGACY_TO_CANONICAL = {
  admin: "Admin",
  owner: "Owner",
  area_manager: "AreaManager",
  areamanager: "AreaManager",
  store_manager: "StoreManager",
  storemanager: "StoreManager",
  manager: "StoreManager",
  assistant_manager: "SubManager",
  assistantmanager: "SubManager",
  sub_manager: "SubManager",
  submanager: "SubManager",
  employee: "FullTimeStaff",
  employees: "FullTimeStaff",
  staff: "FullTimeStaff",
  worker: "FullTimeStaff",
  crew: "FullTimeStaff",
  full_time_staff: "FullTimeStaff",
  full_time: "FullTimeStaff",
  fulltime: "FullTimeStaff",
  part_time: "PartTimeStaff",
  part_time_staff: "PartTimeStaff",
  parttime: "PartTimeStaff",
  parttimestaff: "PartTimeStaff",
  parttimers: "PartTimeStaff",
  public_customer: "PublicCustomer",
  guest: "PublicCustomer",
  customer: "Customer",
  customers: "Customer",
  SubManager: "SubManager",
  StoreManager: "StoreManager",
  AreaManager: "AreaManager",
  Owner: "Owner",
  Admin: "Admin",
  Employee: "FullTimeStaff",
  Staff: "FullTimeStaff",
  PartTime: "PartTimeStaff",
};

const CANONICAL_TO_LEGACY = {
  Admin: "admin",
  Owner: "owner",
  AreaManager: "area_manager",
  StoreManager: "store_manager",
  SubManager: "sub_manager",
  FullTimeStaff: "full_time_staff",
  PartTimeStaff: "part_time_staff",
  Customer: "customer",
  PublicCustomer: "public_customer",
};

/**
 * Convert provided role into canonical DB design name.
 */
export function canonicalRole(role) {
  if (!role) return null;
  const value = String(role).trim();
  if (!value) return null;
  if (ROLE_VALUES.includes(value)) return value;
  const lower = value.toLowerCase();
  const normalized = lower.replace(/[\s_-]/g, "");
  return (
    LEGACY_TO_CANONICAL[value] ||
    LEGACY_TO_CANONICAL[lower] ||
    LEGACY_TO_CANONICAL[normalized] ||
    null
  );
}

/**
 * Convert canonical role into legacy snake_case value.
 */
export function legacyRole(role) {
  if (!role) return null;
  const canonical = canonicalRole(role);
  if (canonical && CANONICAL_TO_LEGACY[canonical]) {
    return CANONICAL_TO_LEGACY[canonical];
  }
  const lower = typeof role === "string" ? role.toLowerCase() : role;
  if (LEGACY_TO_CANONICAL[lower]) return lower;
  return role;
}

export function roleRank(role) {
  const canonical = canonicalRole(role) || role;
  const ranks = {
    Admin: 8,
    Owner: 7,
    AreaManager: 6,
    StoreManager: 5,
    SubManager: 4,
    FullTimeStaff: 3,
    PartTimeStaff: 2,
    Customer: 1,
    PublicCustomer: 0,
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
