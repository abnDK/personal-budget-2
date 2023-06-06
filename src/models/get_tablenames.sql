-- extract tablename and save to file '/pg_tmp/tablenames'

COPY (SELECT relname FROM pg_class JOIN pg_authid ON 
pg_class.relowner=pg_authid.oid JOIN pg_namespace ON pg_class.relnamespace=pg_namespace.oid WHERE nspname = 'public' AND reltype <> 0)
TO STDOUT;
