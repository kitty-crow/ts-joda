#!/usr/bin/env bash
set -euo pipefail

npx c8 report \
  --temp-directory .c8_output \
  --report-dir build/coverage \
  --reporter=lcov \
  --reporter=html
