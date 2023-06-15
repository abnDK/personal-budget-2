# meant for creating table order for export/import
# of data when resetting database.
# See foreign_key_constraint.sql for comment on order and https://github.com/abnDK/personal-budget-2/issues/17#issuecomment-1578927034

# order should be by generation:
# grand parents first
# then parents
# then children
# and so on...

# adding data to grandparent tables first will not violate foreigh key constraints when 
# importing data again.

#!/bin/bash

# extract foreign key relationships
psql -d personal_budget_2_old -f foreign_key_constraints.sql > foreign_key_constraints.csv

cat foreign_key_constraints.csv

# sort tables using a bfs approach
node sort_tables.js "$(pwd)/tablenames" "$(pwd)/foreign_key_constraints.csv"


