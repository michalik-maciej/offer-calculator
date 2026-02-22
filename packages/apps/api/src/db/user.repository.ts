import { prisma } from "./prisma"

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<void> {
  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  })
}
