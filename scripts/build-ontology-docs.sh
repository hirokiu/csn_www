#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SOURCE_REPOSITORY=${EARTHQUAKE_ONTOLOGY_REPOSITORY:-"$PROJECT_DIR/../earthquake-ontology"}
SOURCE_FILE="$SOURCE_REPOSITORY/ontology/jp-earthquake.ttl"
PUBLISHED_FILE="$PROJECT_DIR/htdocs/ontology/jp-earthquake.ttl"
OUTPUT_DIR="$PROJECT_DIR/htdocs/ontology/docs"
IMAGE=${WIDOCO_IMAGE:-ghcr.io/dgarijo/widoco:v1.4.25}
PLATFORM=${WIDOCO_PLATFORM:-linux/amd64}

if [ ! -f "$SOURCE_FILE" ]; then
    echo "Ontology source was not found: $SOURCE_FILE" >&2
    exit 1
fi

cp "$SOURCE_FILE" "$PUBLISHED_FILE"
mkdir -p "$OUTPUT_DIR"

docker run --rm --platform "$PLATFORM" \
    -v "$PROJECT_DIR/htdocs/ontology:/usr/local/widoco/in:ro" \
    -v "$PROJECT_DIR/ontology-docs:/usr/local/widoco/config:ro" \
    -v "$OUTPUT_DIR:/usr/local/widoco/out" \
    "$IMAGE" \
    -ontFile in/jp-earthquake.ttl \
    -outFolder out \
    -confFile config/config.properties \
    -rewriteAll \
    -lang ja-en \
    -includeAnnotationProperties \
    -webVowl \
    -noPlaceHolderText
cp "$PROJECT_DIR/ontology-docs/index.html" "$OUTPUT_DIR/index.html"

cmp "$SOURCE_FILE" "$PUBLISHED_FILE"
echo "WIDOCO documentation generated in $OUTPUT_DIR"
