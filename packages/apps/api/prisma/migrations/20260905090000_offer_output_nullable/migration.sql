-- An offer whose configuration asks for a component the catalogue does not
-- stock is still worth storing: the input is kept and the pricing is left empty
-- until the configuration is fixed.
ALTER TABLE "Offer" ALTER COLUMN "output" DROP NOT NULL;
