import bcrypt from "bcryptjs"

const PASSWORD_SALT_ROUNDS = 10

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS)
}
