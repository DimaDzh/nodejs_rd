#!/bin/bash

# ── parse migration name from:  dummy  |  --name=dummy  |  --name dummy ──
case "${1:-}" in
  --name=*)              MIG_NAME="${1#--name=}"; shift ;;
  --name)                MIG_NAME="${2:-}";       shift 2 ;;
  --*)                   echo "Unknown flag: $1"; exit 1 ;;
  *)                     MIG_NAME="${1:-}";       shift ;;
esac

# fallback to npm_config_name if still empty (equal-sign form when $1 was flag)
[[ -z "${MIG_NAME:-}" && -n "${npm_config_name:-}" ]] && MIG_NAME="$npm_config_name"

if [[ -z "${MIG_NAME:-}" ]]; then
  echo "❌  Usage: pnpm migration:generate dummy"
  echo "    or    pnpm migration:generate --name=dummy"
  echo "    or    pnpm migration:generate --name dummy"
  exit 1
fi

export NAME="$MIG_NAME"

echo "▸ Generating TypeORM migration '${NAME}' …"
npx ts-node-esm ./node_modules/typeorm/cli.js \
  migration:generate -d ./src/data-source.ts "./src/migrations/${NAME}"
