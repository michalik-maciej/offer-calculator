import { Offer, Prisma } from "@prisma/client"

import { prisma } from "./prisma"

export type CreateOfferInput = {
  title: string
  discountPercentage?: number
  input: Prisma.InputJsonValue
  output?: Prisma.InputJsonValue | Prisma.NullTypes.DbNull
}

export type UpdateOfferInput = Partial<CreateOfferInput> & {
  id: string
}

export async function createOffer(data: CreateOfferInput): Promise<Offer> {
  return prisma.offer.create({ data })
}

export async function updateOffer(data: UpdateOfferInput): Promise<Offer> {
  const { id, ...update } = data

  return prisma.offer.update({
    where: { id },
    data: update,
  })
}

export async function getAllOffers(): Promise<
  Pick<Offer, "createdAt" | "id" | "title">[]
> {
  return prisma.offer.findMany({
    select: {
      createdAt: true,
      id: true,
      title: true,
    },
  })
}

export async function getOfferById(id: string): Promise<Offer | null> {
  return prisma.offer.findUnique({ where: { id } })
}

export async function deleteOffer(id: string): Promise<Offer> {
  return prisma.offer.delete({ where: { id } })
}
