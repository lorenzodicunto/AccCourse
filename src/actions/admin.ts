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
  userRole?: string;
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

  const validRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR", "REVIEWER", "VIEWER"];
  const role = validRoles.includes(data.userRole || "") ? data.userRole : "EDITOR";

  const user = await prisma.user.create({
    data: {
      email: data.userEmail,
      passwordHash,
      name: data.userName,
      role,
      tenantId: tenant.id,
    },
  });

  return { tenant, user: { id: user.id, email: user.email, name: user.name } };
}

// ─── Helper: require ADMIN or SUPER_ADMIN ───
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))
    throw new Error("Acesso negado — requer Admin ou Super Admin");
  return user;
}

// ─── Create user in existing tenant ───
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  tenantId?: string;
}) {
  const admin = await requireAdmin();

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email já está em uso.");

  const validRoles = ["ADMIN", "EDITOR", "REVIEWER", "VIEWER"] as const;
  type ValidRole = (typeof validRoles)[number];
  const role: ValidRole = validRoles.includes(data.role as ValidRole)
    ? (data.role as ValidRole)
    : "EDITOR";

  // ADMIN can only create users in their own tenant
  const tenantId =
    admin.role === "SUPER_ADMIN"
      ? data.tenantId ?? admin.tenantId
      : admin.tenantId;

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role,
      tenantId,
    },
    include: { tenant: true },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// ─── Update user ───
export async function updateUser(
  userId: string,
  data: { name?: string; role?: string; tenantId?: string | null }
) {
  const admin = await requireAdmin();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Usuário não encontrado.");

  // ADMIN can only manage users within their tenant
  if (admin.role === "ADMIN" && target.tenantId !== admin.tenantId)
    throw new Error("Sem permissão para editar este usuário.");

  // Cannot escalate to SUPER_ADMIN unless you are one
  if (data.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN")
    throw new Error("Somente Super Admin pode atribuir esse papel.");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.tenantId !== undefined && admin.role === "SUPER_ADMIN")
    updateData.tenantId = data.tenantId;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { tenant: true },
  });
  return updated;
}

// ─── Delete user ───
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();

  if (admin.id === userId)
    throw new Error("Você não pode excluir sua própria conta por aqui.");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Usuário não encontrado.");

  if (admin.role === "ADMIN" && target.tenantId !== admin.tenantId)
    throw new Error("Sem permissão para excluir este usuário.");

  if (target.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN")
    throw new Error("Somente Super Admin pode excluir outro Super Admin.");

  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
}

// ─── Reset user password ───
export async function resetUserPassword(userId: string, newPassword: string) {
  const admin = await requireAdmin();

  if (newPassword.length < 6)
    throw new Error("A senha deve ter pelo menos 6 caracteres.");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Usuário não encontrado.");

  if (admin.role === "ADMIN" && target.tenantId !== admin.tenantId)
    throw new Error("Sem permissão para redefinir senha deste usuário.");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  return { success: true };
}
