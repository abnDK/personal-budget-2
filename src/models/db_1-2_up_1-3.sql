-- ### MIGRATE 1-2 >> 1-3

-- add budget
-- rename expense => transaction
-- rename envelope => category
-- add self ref to category
-- add foreign key from category to budget

CREATE TABLE budget (id SERIAL PRIMARY KEY, name VARCHAR(50), date_start TIMESTAMP, date_end TIMESTAMP);
GRANT SELECT, INSERT, UPDATE, DELETE ON budget TO pb2_app;
GRANT SELECT, UPDATE ON budget_id_seq TO pb2_app;

-- rename tables and column names
ALTER TABLE expense RENAME TO transaction;
ALTER TABLE envelope RENAME TO category;
ALTER TABLE transaction RENAME COLUMN envelope_id TO category_id;

-- add columns
ALTER TABLE category ADD COLUMN parent_id INTEGER REFERENCES category (id);
ALTER TABLE category ADD COLUMN budget_id INTEGER REFERENCES budget (id);

-- rename indexes
ALTER INDEX envelope_pkey RENAME TO category_pkey;
ALTER INDEX expense_pkey RENAME TO transaction_pkey;

-- rename constraints
UPDATE pg_constraint SET conname = 'transaction_pkey' WHERE conname = 'expense_pkey';
UPDATE pg_constraint SET conname = 'transaction_category_id_fkey' WHERE conname = 'expense_envelope_id_fkey';
UPDATE pg_constraint SET conname = 'category_pkey' WHERE conname = 'envelope_pkey';

-- rename sequences
ALTER SEQUENCE expense_id_seq RENAME TO transaction_id_seq;
ALTER SEQUENCE envelope_id_seq RENAME TO category_id_seq;
