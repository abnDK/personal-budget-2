#!/bin/bash

filename="upfiles"

while read -r  line

do

psql -d personal_budget_2 -U abndk -a -f "$line"

done < "$filename"

