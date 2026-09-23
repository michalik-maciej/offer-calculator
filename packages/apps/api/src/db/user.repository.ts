import { Role, User } from "@prisma/client"

import { prisma } from "./prisma"

export type UserSummary = Pick<User, "id" | "email" | "role">

export type UserStore = {
  createUser: (
    email: string,
    passwordHash: string,
    role?: Role,
  ) => Promise<User>
  deleteUser: (id: string) => Promise<User>
  getUserByEmail: (email: string) => Promise<User | null>
  listUsers: () => Promise<UserSummary[]>
  updateUserPassword: (id: string, passwordHash: string) => Promise<User>
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: Role = Role.USER,
): Promise<User> {
  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role,
    },
  })
}

export async function listUsers(): Promise<UserSummary[]> {
  return prisma.user.findMany({
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
  })
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({ where: { id } })
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: { password: passwordHash },
  })
}

export const userStore: UserStore = {
  createUser,
  deleteUser,
  getUserByEmail,
  listUsers,
  updateUserPassword,
}
