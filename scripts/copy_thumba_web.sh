#!/bin/bash

# Define source and destination directories
SOURCE="/Users/smanjawira/Documents/senze/projects/thumba-web"
DEST="/Users/smanjawira/Documents/senze/projects/thumba-app/www"

# Create the destination folder if it doesn't exist
mkdir -p "$DEST"

# Copy files and directories
cp -a "$SOURCE/." "$DEST"

# Output confirmation
echo "All files from $SOURCE have been copied to $DEST"
