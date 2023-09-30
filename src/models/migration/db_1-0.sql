-- ### CREATING DB v 1-0

CREATE TABLE envelope (id SERIAL PRIMARY KEY, name TEXT, amount REAL);

CREATE TABLE expense (id SERIAL PRIMARY KEY, name TEXT, amount REAL, date 
DATE, envelope_id INTEGER REFERENCES envelope (id));

-- grant access to pb2_app role:
GRANT SELECT, INSERT, UPDATE, DELETE ON envelope TO pb2_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON expense TO pb2_app;
GRANT SELECT, UPDATE ON envelope_id_seq TO pb2_app;
GRANT SELECT, UPDATE ON expense_id_seq TO pb2_app;

