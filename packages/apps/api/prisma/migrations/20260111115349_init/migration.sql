-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('back', 'baseCover', 'foot', 'leg', 'misc', 'shelf', 'support');

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Component_category_idx" ON "Component"("category");
