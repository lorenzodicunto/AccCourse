"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

// ─── List all tenants ───
export async function listTenants() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  return prisma.tenant.findMany({
    include: { _count: { select: { users: true, courses: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ─── List all users ───
export async function listUsers() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  return prisma.user.findMany({
    include: { tenant: true },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Provision a new client (Tenant + User) ───
export async function provisionClient(data: {
  companyName: string;
  userName: string;
  userEmail: string;
  userPassword: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const existing = await prisma.user.findUnique({
    where: { email: data.userEmail },
  });
  if (existing) throw new Error("Email already in use");

  const tenant = await prisma.tenant.create({
    data: { name: data.companyName },
  });

  const passwordHash = await bcrypt.hash(data.userPassword, 12);

  const user = await prisma.user.create({
    data: {
      email: data.userEmail,
      passwordHash,
      name: data.userName,
      role: "AUTHOR",
      tenantId: tenant.id,
    },
  });

  return { tenant, user: { id: user.id, email: user.email, name: user.name } };
}
