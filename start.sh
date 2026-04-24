#!/bin/bash
bun run dev > dev.log 2>&1 &
sleep 20
top -b -n 1 | head -n 20
pkill -9 node
pkill -9 bun
