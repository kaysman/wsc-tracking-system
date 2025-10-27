export const PERMISSIONS = {
  // Users
  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_LIST: "users.list",

  // Roles & Permissions
  ROLES_CREATE: "roles.create",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  ROLES_LIST: "roles.list",
  PERMISSIONS_MANAGE: "permissions.manage",

  // Offices
  OFFICES_CREATE: "offices.create",
  OFFICES_READ: "offices.read",
  OFFICES_UPDATE: "offices.update",
  OFFICES_DELETE: "offices.delete",
  OFFICES_LIST: "offices.list",

  // Branches
  BRANCHES_CREATE: "branches.create",
  BRANCHES_READ: "branches.read",
  BRANCHES_UPDATE: "branches.update",
  BRANCHES_DELETE: "branches.delete",
  BRANCHES_LIST: "branches.list",

  // Trucks
  TRUCKS_CREATE: "trucks.create",
  TRUCKS_READ: "trucks.read",
  TRUCKS_UPDATE: "trucks.update",
  TRUCKS_DELETE: "trucks.delete",
  TRUCKS_LIST: "trucks.list",
  TRUCKS_ASSIGN: "trucks.assign",

  // Deliveries
  DELIVERIES_CREATE: "deliveries.create",
  DELIVERIES_READ: "deliveries.read",
  DELIVERIES_UPDATE: "deliveries.update",
  DELIVERIES_DELETE: "deliveries.delete",
  DELIVERIES_LIST: "deliveries.list",
  DELIVERIES_CANCEL: "deliveries.cancel",
  DELIVERIES_COMPLETE: "deliveries.complete",

  // Delivery Places
  DELIVERY_PLACES_CREATE: "delivery_places.create",
  DELIVERY_PLACES_READ: "delivery_places.read",
  DELIVERY_PLACES_UPDATE: "delivery_places.update",
  DELIVERY_PLACES_DELETE: "delivery_places.delete",
  DELIVERY_PLACES_LIST: "delivery_places.list",

  // Reports & Analytics
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  ANALYTICS_VIEW: "analytics.view",

  // Activity Logs
  LOGS_VIEW: "logs.view",
  LOGS_EXPORT: "logs.export",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Grouping
export const PERMISSION_GROUPS = {
  // Admin - Full access
  ADMIN: Object.values(PERMISSIONS),

  // Employee - Basic operations
  EMPLOYEE: [
    PERMISSIONS.TRUCKS_READ,
    PERMISSIONS.TRUCKS_LIST,
    PERMISSIONS.DELIVERIES_CREATE,
    PERMISSIONS.DELIVERIES_READ,
    PERMISSIONS.DELIVERIES_UPDATE,
    PERMISSIONS.DELIVERIES_LIST,
    PERMISSIONS.DELIVERY_PLACES_READ,
    PERMISSIONS.DELIVERY_PLACES_LIST,
  ],
} as const;

export function isValidPermission(
  permission: string
): permission is PermissionKey {
  return Object.values(PERMISSIONS).includes(permission as PermissionKey);
}
