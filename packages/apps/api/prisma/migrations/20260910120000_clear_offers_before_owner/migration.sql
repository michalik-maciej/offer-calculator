-- Offers predate ownership and cannot be attributed to a user, so they are
-- dropped before "Offer"."userId" becomes required.
DELETE FROM "Offer";
