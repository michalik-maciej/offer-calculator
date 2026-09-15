import { randomUUID } from "node:crypto"
import { Role, User } from "@prisma/client"

import { UserStore } from "../db/user.repository"

type TestUserStore = UserStore & { all: () => User[] }

export function createInMemoryUserStore(): TestUserStore {
  const stored = new Map<string, User>()

  return {
    all: () => [...stored.values()],

    createUser: async (
      email: string,
      passwordHash: string,
      role: Role = Role.USER,
    ) => {
      const user: User = {
        createdAt: new Date(),
        email,
        id: randomUUID(),
        password: passwordHash,
        role,
      }

      stored.set(email, user)
      return user
    },

    getUserByEmail: async (email: string) => stored.get(email) ?? null,
  }
}
