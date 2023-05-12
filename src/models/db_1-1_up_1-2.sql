
-- expense
-- from:
--   id integer
--   name text
--   amount real
--   date timestamp without time zone
--   envelope_id integer
--   recipient text

-- to:
--   id integer
--   name text
--   amount real
--   date timestamp without time zone
--   envelope_id integer
--   recipient text
--   comment text

ALTER TABLE expense ADD COLUMN comment text;

