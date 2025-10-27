import { PrismaClient } from "@prisma/client";
import { PERMISSION_GROUPS } from "../src/shared/permissions";

const prisma = new PrismaClient();

/**
 * Production-ready seed data for roles
 * These roles are fundamental to the system and should exist in all environments
 */
const ROLES = [
  {
    name: "SUPER_ADMIN",
    description:
      "Super Administrator with unrestricted access to all system features and data. Can manage users, roles, and all operational aspects.",
    permissions: PERMISSION_GROUPS.ADMIN,
    isSystem: true, // Cannot be deleted
    active: true,
  },
  {
    name: "DIRECTOR",
    description:
      "Director with strategic oversight. Has read access to all modules, can view reports, analytics, and activity logs for decision-making purposes.",
    permissions: PERMISSION_GROUPS.DIRECTOR,
    isSystem: true,
    active: true,
  },
  {
    name: "MANAGER",
    description:
      "Branch/Office Manager with operational authority. Can manage trucks, deliveries, and delivery places. Has limited user management capabilities.",
    permissions: PERMISSION_GROUPS.MANAGER,
    isSystem: true,
    active: true,
  },
  {
    name: "EMPLOYEE",
    description:
      "General Employee with basic operational access. Can view trucks, create and manage deliveries, and view delivery places.",
    permissions: PERMISSION_GROUPS.EMPLOYEE,
    isSystem: true,
    active: true,
  },
  {
    name: "DRIVER",
    description:
      "Driver with limited access. Can view assigned deliveries and update delivery status. Read-only access to delivery places.",
    permissions: [
      "deliveries.read",
      "deliveries.update",
      "deliveries.list",
      "deliveries.complete",
      "delivery_places.read",
      "trucks.read",
    ],
    isSystem: false,
    active: true,
  },
] as const;

/**
 * Production-ready seed data for offices
 * Main headquarters office
 */
const OFFICES = [
  {
    name: "Main Office - Ashgabat",
    code: "WSC-001",
    phone: "+993-12-123456",
    email: "main@wscts.tm",
    description: "Main headquarters office in Ashgabat",
    active: true,
    address: {
      street: "Archabil Avenue 56",
      city: "Ashgabat",
      district: "Arçabil",
      region: "Ahal Region",
      postalCode: "744000",
      country: "Turkmenistan",
      latitude: 37.9601,
      longitude: 58.3261,
      notes: "Main headquarters location",
    },
  },
  {
    name: "Regional Office - Mary",
    code: "WSC-002",
    phone: "+993-522-12345",
    email: "mary@wscts.tm",
    description: "Regional office covering Mary Province",
    active: true,
    address: {
      street: "Turkmenbashy Avenue 45",
      city: "Mary",
      district: "Central",
      region: "Mary Region",
      postalCode: "745400",
      country: "Turkmenistan",
      latitude: 37.5945,
      longitude: 61.8304,
      notes: "Mary regional office",
    },
  },
] as const;

async function seedRoles() {
  console.log("\n📋 Seeding roles...");
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const roleData of ROLES) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      // Update existing role if permissions have changed
      const permissionsChanged =
        JSON.stringify(existingRole.permissions.sort()) !==
        JSON.stringify([...roleData.permissions].sort());

      if (permissionsChanged) {
        await prisma.role.update({
          where: { name: roleData.name },
          data: {
            description: roleData.description,
            permissions: roleData.permissions as string[],
            isSystem: roleData.isSystem,
            active: roleData.active,
          },
        });
        console.log(`  ↻ Updated role: ${roleData.name}`);
        updatedCount++;
      } else {
        console.log(`  ○ Skipped role (no changes): ${roleData.name}`);
        skippedCount++;
      }
    } else {
      // Create new role
      await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions as string[],
          isSystem: roleData.isSystem,
          active: roleData.active,
        },
      });
      console.log(`  ✓ Created role: ${roleData.name}`);
      createdCount++;
    }
  }

  return { createdCount, updatedCount, skippedCount };
}

async function seedOffices() {
  console.log("\n🏢 Seeding offices...");
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const officeData of OFFICES) {
    const existingOffice = await prisma.office.findUnique({
      where: { code: officeData.code },
      include: { address: true },
    });

    if (existingOffice) {
      // Check if office or address data has changed
      const officeChanged =
        existingOffice.name !== officeData.name ||
        existingOffice.phone !== officeData.phone ||
        existingOffice.email !== officeData.email ||
        existingOffice.description !== officeData.description;

      const addressChanged =
        existingOffice.address.street !== officeData.address.street ||
        existingOffice.address.city !== officeData.address.city ||
        existingOffice.address.district !== officeData.address.district;

      if (officeChanged || addressChanged) {
        // Update office and address
        await prisma.office.update({
          where: { code: officeData.code },
          data: {
            name: officeData.name,
            phone: officeData.phone,
            email: officeData.email,
            description: officeData.description,
            active: officeData.active,
            address: {
              update: {
                street: officeData.address.street,
                city: officeData.address.city,
                district: officeData.address.district,
                region: officeData.address.region,
                postalCode: officeData.address.postalCode,
                country: officeData.address.country,
                latitude: officeData.address.latitude,
                longitude: officeData.address.longitude,
                notes: officeData.address.notes,
              },
            },
          },
        });
        console.log(`  ↻ Updated office: ${officeData.name}`);
        updatedCount++;
      } else {
        console.log(`  ○ Skipped office (no changes): ${officeData.name}`);
        skippedCount++;
      }
    } else {
      // Create new office with address
      await prisma.office.create({
        data: {
          name: officeData.name,
          code: officeData.code,
          phone: officeData.phone,
          email: officeData.email,
          description: officeData.description,
          active: officeData.active,
          address: {
            create: {
              street: officeData.address.street,
              city: officeData.address.city,
              district: officeData.address.district,
              region: officeData.address.region,
              postalCode: officeData.address.postalCode,
              country: officeData.address.country,
              latitude: officeData.address.latitude,
              longitude: officeData.address.longitude,
              notes: officeData.address.notes,
            },
          },
        },
      });
      console.log(`  ✓ Created office: ${officeData.name}`);
      createdCount++;
    }
  }

  return { createdCount, updatedCount, skippedCount };
}

async function main() {
  console.log("🌱 Starting database seed...");
  console.log("━".repeat(50));

  try {
    // Check database connection
    await prisma.$connect();
    console.log("✓ Database connection established");

    // Seed roles
    const roleStats = await seedRoles();

    // Seed offices
    const officeStats = await seedOffices();

    // Summary
    console.log("\n" + "━".repeat(50));
    console.log("📊 Seed Summary:");
    console.log("\n  Roles:");
    console.log(`    • Created: ${roleStats.createdCount}`);
    console.log(`    • Updated: ${roleStats.updatedCount}`);
    console.log(`    • Skipped: ${roleStats.skippedCount}`);
    console.log(`    • Total: ${ROLES.length} role(s) processed`);
    console.log("\n  Offices:");
    console.log(`    • Created: ${officeStats.createdCount}`);
    console.log(`    • Updated: ${officeStats.updatedCount}`);
    console.log(`    • Skipped: ${officeStats.skippedCount}`);
    console.log(`    • Total: ${OFFICES.length} office(s) processed`);
    console.log("━".repeat(50));

    // Display role hierarchy
    console.log("\n🔐 Role Hierarchy:");
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        permissions: true,
        isSystem: true,
      },
    });

    roles.forEach((role, index) => {
      const tree = index === roles.length - 1 ? "└──" : "├──";
      const systemBadge = role.isSystem ? " [SYSTEM]" : "";
      console.log(
        `${tree} ${role.name}${systemBadge} (${role.permissions.length} permissions)`
      );
    });

    // Display office list
    console.log("\n🏢 Office List:");
    const offices = await prisma.office.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        address: {
          select: {
            city: true,
            region: true,
          },
        },
      },
    });

    offices.forEach((office, index) => {
      const tree = index === offices.length - 1 ? "└──" : "├──";
      console.log(
        `${tree} [${office.code}] ${office.name} - ${office.address.city}, ${office.address.region}`
      );
    });

    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
