#!/bin/bash
# Export all Draw.io diagrams to SVG and PNG formats

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting diagram export process...${NC}"

# Source and destination directories
SRC_DIR="docs/diagrams-src"
DEST_DIR="docs/static/diagrams"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Find all .drawio files
find "$SRC_DIR" -name "*.drawio" | while read -r file; do
  # Get relative path and filename
  rel_path="${file#$SRC_DIR/}"
  dir_path="$(dirname "$rel_path")"
  filename="$(basename "$file" .drawio)"

  # Create destination subdirectory
  mkdir -p "$DEST_DIR/$dir_path"

  echo -e "${YELLOW}Exporting: $rel_path${NC}"

  # Export to SVG
  drawio --export \
    --format svg \
    --output "$DEST_DIR/$dir_path/$filename.svg" \
    "$file"

  # Export to PNG (high resolution)
  drawio --export \
    --format png \
    --scale 2 \
    --output "$DEST_DIR/$dir_path/$filename.png" \
    "$file"

  echo -e "${GREEN}✓ Exported: $filename.svg and $filename.png${NC}"
done

echo -e "${GREEN}Diagram export complete!${NC}"
