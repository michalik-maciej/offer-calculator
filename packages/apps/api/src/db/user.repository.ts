import { Role, User } from "@prisma/client"

import { prisma } from "./prisma"

export type UserStore = {
  createUser: (
    email: string,
    passwordHash: string,
    role?: Role,
  ) => Promise<User>
  getUserByEmail: (email: string) => Promise<User | null>
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

export const userStore: UserStore = {
  createUser,
  getUserByEmail,
}
