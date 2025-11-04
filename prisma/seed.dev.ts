import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { PERMISSION_GROUPS } from "../src/shared/permissions";

const prisma = new PrismaClient();

async function seedDevData() {
  console.log("\nStarting development database seed...");
  console.log("━".repeat(50));

  try {
    await prisma.$connect();
    console.log("✓ Database connection established");

    // 1. Create or get SUPER_ADMIN role
    console.log("\nSetting up SUPER_ADMIN role...");
    let superAdminRole = await prisma.role.findUnique({
      where: { name: "SUPER_ADMIN" },
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: "SUPER_ADMIN",
          description:
            "Super Administrator with unrestricted access to all system features and data.",
          permissions: PERMISSION_GROUPS.ADMIN as string[],
          isSystem: true,
          active: true,
        },
      });
      console.log("  ✓ Created SUPER_ADMIN role");
    } else {
      console.log("  ○ SUPER_ADMIN role already exists");
    }

    // 2. Create office
    console.log("\nSetting up office...");
    let office = await prisma.office.findUnique({
      where: { code: "TSUK-001" },
      include: { address: true },
    });

    if (!office) {
      office = await prisma.office.create({
        data: {
          name: "Turkmenistanyn Suw Upjuncilik Komiteti",
          code: "TSUK-001",
          phone: "+993 12 345678",
          email: "support@tsuk.com.tm",
          active: true,
          address: {
            create: {
              city: "Asgabat",
              street: "",
              district: "",
              region: "Ahal Region",
              postalCode: "",
              country: "Turkmenistan",
              latitude: 0,
              longitude: 0,
            },
          },
        },
        include: { address: true },
      });
      console.log(`  ✓ Created office: ${office.name}`);
    } else {
      console.log(`  ○ Office already exists: ${office.name}`);
    }

    console.log("\nSetting up super admin user...");
    const phone = "+993 12 000000";
    let superAdminUser = await prisma.user.findUnique({
      where: { phone },
      include: { role: true, office: true },
    });

    if (!superAdminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      superAdminUser = await prisma.user.create({
        data: {
          name: "admin",
          surname: "",
          fathername: "",
          phone,
          password: hashedPassword,
          email: "admin@tsuk.com.tm",
          active: true,
          isVerified: true,
          roleId: superAdminRole.id,
          officeId: office.id,
        },
        include: { role: true, office: true },
      });
      console.log(`  ✓ Created super admin user: ${superAdminUser.name}`);
    } else {
      console.log(
        `  ○ Super admin user already exists: ${superAdminUser.name}`
      );
    }

    console.log("\n" + "━".repeat(50));
    console.log("\n  Setup Details:");
    console.log(`    • Role: ${superAdminRole.name}`);
    console.log(`    • Office: ${office.name} (${office.code})`);
    console.log(`    • User: ${superAdminUser.name}`);
    console.log(`    • Phone: ${superAdminUser.phone}`);
    console.log(`    • Password: admin123`);
    console.log("━".repeat(50));

    console.log("\nDevelopment seed completed successfully!");
    console.log("\nCredentials:");
    console.log(`    Phone: ${superAdminUser.phone}`);
    console.log(`    Password: admin123`);
  } catch (error) {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDevData().catch((error) => {
  console.error(error);
  process.exit(1);
});
