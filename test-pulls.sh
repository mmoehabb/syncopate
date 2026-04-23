#!/bin/bash
cat apps/web/src/lib/command-registry.ts | grep -n "name: " | awk -F':' '{print $2}' | sed 's/name://g' | sed 's/[ ",]//g'
