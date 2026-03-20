// Simple seed script that works without tsx
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function seed() {
  const prisma = new PrismaClient();
  const email = "admin@acccourse.com";

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("✅ Super Admin already exists:", email);
      return;
    }

    const passwordHash = await bcrypt.hash("admin", 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        tenantId: null,
      },
    });

    console.log("✅ Super Admin created:", email, "/ password: admin");
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed().then(() => process.exit(0));
