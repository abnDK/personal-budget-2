-- renames current database to "_old" (and drops previous _old version)

DROP DATABASE IF EXISTS personal_budget_2_old;
ALTER DATABASE personal_budget_2 RENAME TO personal_budget_2_old;

