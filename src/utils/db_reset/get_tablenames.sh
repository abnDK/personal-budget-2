#!/bin/bash

# get tablenames from database
psql -d personal_budget_2 -f $(pwd)/db_reset/get_tablenames.sql > $(pwd)/db_reset/tablenames

# get fkey constraints (for ordering tables in relevant insertion order)
psql -d personal_budget_2 -f $(pwd)/db_reset/foreign_key_constraints.sql > $(pwd)/db_reset/foreign_key_constraints.csv