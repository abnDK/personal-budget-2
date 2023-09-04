-- renames current database to "_old" (and drops previous _old version)

DROP DATABASE IF EXISTS pb2_old;
ALTER DATABASE pb2 RENAME TO pb2_old;

