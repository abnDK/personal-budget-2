#!/bin/bash


psql -d personal_budget_2 -f get_tablenames.sql > tablenames
