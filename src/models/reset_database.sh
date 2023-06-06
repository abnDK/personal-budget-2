#!/bin/bash

# reset database and recreate

# rename current db to "_old"
psql -d postgres -U abndk -a -f oldify_database.sql

# create database
psql -d postgres -U abndk -a -f create_database.sql

