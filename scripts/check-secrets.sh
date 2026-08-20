#!/bin/sh
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$PROJECT_DIR"

if rg --hidden \
    --glob '!.git/**' \
    --glob '!htdocs/ontology/docs/**' \
    --glob '!.env.example' \
    -n 'AIza[0-9A-Za-z_-]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' .
then
    echo "Potential secret detected. Remove it before committing." >&2
    exit 1
fi

echo "No known secret patterns detected."
