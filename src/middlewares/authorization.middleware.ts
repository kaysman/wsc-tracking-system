import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/AppError.js";
import { JWTPayload } from "../shared/types/common.js";
import logger from "../shared/logger.js";
import prisma from "../shared/prisma.js";

type PermissionKey = string;

const permissionCache = new Map<number, Set<string>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<number, number>();

export const clearUserPermissionCache = (userId: number): void => {
  permissionCache.delete(userId);
  cacheTimestamps.delete(userId);
};

async function getUserPermissions(
  userId: number,
  roleId: number
): Promise<Set<string>> {
  const cached = permissionCache.get(userId);
  const timestamp = cacheTimestamps.get(userId);

  if (cached && timestamp && Date.now() - timestamp < CACHE_TTL) {
    return cached;
  }

  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
      active: true,
    },
    select: {
      permissions: true,
    },
  });

  if (!role) {
    return new Set<string>();
  }

  const permissions = new Set<string>(role.permissions || []);

  permissionCache.set(userId, permissions);
  cacheTimestamps.set(userId, Date.now());

  return permissions;
}

export const requirePermission = (...requiredPermissions: PermissionKey[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user as JWTPayload;

      if (!user) {
        throw new UnauthorizedError("Authentication required");
      }

      const userPermissions = await getUserPermissions(
        user.userId,
        user.roleId
      );

      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.has(permission)
      );

      if (!hasPermission) {
        logger.warn(
          {
            userId: user.userId,
            roleId: user.roleId,
            requiredPermissions,
            userPermissions: Array.from(userPermissions),
          },
          "Permission denied"
        );
        throw new ForbiddenError("Permission denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAllPermissions = (
  ...requiredPermissions: PermissionKey[]
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user as JWTPayload;

      if (!user) {
        throw new UnauthorizedError("Authentication required");
      }

      const userPermissions = await getUserPermissions(
        user.userId,
        user.roleId
      );

      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.has(permission)
      );

      if (!hasAllPermissions) {
        const missing = requiredPermissions.filter(
          (p) => !userPermissions.has(p)
        );
        logger.warn(
          {
            userId: user.userId,
            roleId: user.roleId,
            missingPermissions: missing,
          },
          "Missing required permissions"
        );
        throw new ForbiddenError("Permission denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireScopeAccess = (options?: { allowSuperAdmin?: boolean }) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user as JWTPayload;

      if (!user) {
        throw new UnauthorizedError("Authentication required");
      }

      const requestedOfficeId =
        Number(req.params.officeId) ||
        Number(req.query.officeId) ||
        Number(req.body.officeId) ||
        null;

      const requestedBranchId =
        Number(req.params.branchId) ||
        Number(req.query.branchId) ||
        Number(req.body.branchId) ||
        null;

      if (options?.allowSuperAdmin) {
        const userRole = await prisma.role.findUnique({
          where: { id: user.roleId },
          select: { name: true },
        });

        if (userRole?.name === "SUPER_ADMIN" || userRole?.name === "ADMIN") {
          return next();
        }
      }

      if (requestedOfficeId) {
        if (!user.officeId) {
          throw new ForbiddenError("User is not assigned to any office");
        }

        if (user.officeId !== requestedOfficeId) {
          logger.warn(
            {
              userId: user.userId,
              userOfficeId: user.officeId,
              requestedOfficeId,
            },
            "Office access denied"
          );
          throw new ForbiddenError("Access denied to this office");
        }
      }

      if (requestedBranchId) {
        if (!user.branchId) {
          if (!user.officeId) {
            throw new ForbiddenError(
              "User is not assigned to any branch or office"
            );
          }

          const branch = await prisma.branch.findUnique({
            where: { id: requestedBranchId },
            select: { officeId: true },
          });

          if (!branch || branch.officeId !== user.officeId) {
            logger.warn(
              {
                userId: user.userId,
                userOfficeId: user.officeId,
                requestedBranchId,
                branchOfficeId: branch?.officeId,
              },
              "Branch access denied"
            );
            throw new ForbiddenError("Access denied to this branch");
          }
        } else {
          if (user.branchId !== requestedBranchId) {
            logger.warn(
              {
                userId: user.userId,
                userBranchId: user.branchId,
                requestedBranchId,
              },
              "Branch access denied"
            );
            throw new ForbiddenError("Access denied to this branch");
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorize = (
  permissions: PermissionKey | PermissionKey[],
  options?: {
    requireAll?: boolean;
    allowSuperAdmin?: boolean;
  }
) => {
  const permArray = Array.isArray(permissions) ? permissions : [permissions];

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const permissionCheck = options?.requireAll
      ? requireAllPermissions(...permArray)
      : requirePermission(...permArray);

    permissionCheck(req, res, (permErr) => {
      if (permErr) return next(permErr);

      const scopeCheck = requireScopeAccess({
        allowSuperAdmin: options?.allowSuperAdmin,
      });
      scopeCheck(req, res, next);
    });
  };
};
