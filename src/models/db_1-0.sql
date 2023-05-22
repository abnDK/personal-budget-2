-- SQL statements for creating tables v. 1-0

CREATE TABLE envelope (id serial PRIMARY KEY, name text, amount real);

CREATE TABLE expense (id serial PRIMARY KEY, name text, amount real, date 
timestamp, envelope_id integer REFERENCES envelope (id));

-- grant access to pb2_app role:
GRANT SELECT, INSERT, UPDATE, DELETE ON envelope TO pb2_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON expense TO pb2_app;
GRANT SELECT, UPDATE ON envelope_id_seq TO pb2_app;
GRANT SELECT, UPDATE ON expense_id_seq TO pb2_app;

