#!/bin/bash

filename="current_version"

version_number=$(head -n 1 $filename)

echo "test_data_$version_number.sql"
