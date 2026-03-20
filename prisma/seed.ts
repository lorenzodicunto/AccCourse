import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  const email = "admin@acccourse.com";

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
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
