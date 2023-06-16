#!/bin/bash

# reset database and recreate

# rename current db to "_old"
psql -d postgres -U abndk -a -f "$(pwd)/db_reset/oldify_database.sql"

# create database
psql -d postgres -U abndk -a -f "$(pwd)/db_reset/create_database.sql"

