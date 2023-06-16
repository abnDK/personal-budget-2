-- ### MIGRATE 1-3 >> 1-2

-- rename indexes
ALTER INDEX transaction_pkey RENAME TO expense_pkey; 
ALTER INDEX category_pkey RENAME TO envelope_pkey;

-- rename sequences
ALTER SEQUENCE category_id_seq RENAME TO envelope_id_seq;
ALTER SEQUENCE transaction_id_seq RENAME TO expense_id_seq;

-- rename constraints
UPDATE pg_constraint SET conname = 'envelope_pkey' WHERE conname = 'category_pkey';
UPDATE pg_constraint SET conname = 'expense_envelope_id_fkey' WHERE conname = 'transaction_category_id_fkey';
UPDATE pg_constraint SET conname = 'expense_pkey' WHERE conname = 'transaction_pkey';

-- remove columns
ALTER TABLE category DROP COLUMN budget_id;
ALTER TABLE category DROP COLUMN parent_id;

-- rename tables and column names
ALTER TABLE transaction RENAME COLUMN category_id TO envelope_id;
ALTER TABLE category RENAME TO envelope;
ALTER TABLE transaction RENAME TO expense;

-- delete table budget
DROP TABLE budget;





