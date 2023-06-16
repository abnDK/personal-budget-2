-- Will extract foreign key relationships 
-- between tables on the 'public' schema

-- rel mellem constraint og pg_class for conrelid
-- rel mellem constraint og pg_class for confrelid
-- join for #1 er pg_class.oid=pg_constraint.conrelid
-- join for #2 er pg_class.oid=pg_constraint.confrelid
-- relname for #1 er dep_relname
-- relname for #2 er ref_relname
COPY (
    WITH dependent_tables AS (
        SELECT 
            relname AS dep_relname,
            pg_constraint.oid AS con_id,
            conname,
            pg_namespace.nspname AS dep_rel_schema
        FROM pg_class
        JOIN pg_constraint
        ON pg_class.oid=pg_constraint.conrelid
        JOIN pg_namespace
        ON pg_namespace.oid=pg_class.relnamespace
    ), referenced_tables AS (
        SELECT 
            relname AS ref_relname,
            pg_constraint.oid AS con_id
        FROM pg_class
        JOIN pg_constraint
        ON pg_class.oid=pg_constraint.confrelid
    )
    SELECT 
        dep_relname AS "Child",
        ref_relname AS "Parent",
        conname AS "Foreign key name",
        dep_rel_schema AS "Schema"
    FROM dependent_tables
    JOIN referenced_tables
    ON dependent_tables.con_id=referenced_tables.con_id
    WHERE dep_rel_schema='public'
) TO STDOUT WITH (FORMAT csv, DELIMITER ';', HEADER);
