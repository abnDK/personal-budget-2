#!/bin/bash

# reset database and recreate (without tables)

# drop database
psql -d postgres -U abndk -a -f drop_database.sql


# create database
psql -d postgres -U abndk -a -f create_database.sql

