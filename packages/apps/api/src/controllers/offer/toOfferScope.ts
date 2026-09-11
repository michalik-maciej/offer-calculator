import { Role } from "@prisma/client"

import { JwtPayload } from "@/schemas/auth/JwtPayload.schema"

import { OfferScope } from "../../db/offer.repository"

export function toOfferScope(user: JwtPayload | undefined): OfferScope | null {
  if (!user) {
    return null
  }

  return { isAdmin: user.role === Role.ADMIN, userId: user.sub }
}
