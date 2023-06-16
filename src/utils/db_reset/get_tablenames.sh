#!/bin/bash

# get tablenames from database
psql -d personal_budget_2 -f get_tablenames.sql > tablenames

# get fkey constraints (for ordering tables in relevant insertion order)
psql -d personal_budget_2 -f foreign_key_constraints.sql > foreign_key_constraints.csv