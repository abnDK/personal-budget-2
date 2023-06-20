#!/bin/bash

# get tablenames from database
psql -d personal_budget_2 -f $(pwd)/db_reset/get_tablenames.sql > $(pwd)/db_reset/tablenames
