#!/bin/bash
# Quick script to save copied JSON from Supabase SQL Editor
#
# Usage:
# 1. Copy JSON from Supabase SQL Editor
# 2. Run: ./save-json-export.sh madison_system_config_export.json
# 3. Paste the JSON, then press Ctrl+D

FILENAME=${1:-"export.json"}

echo "📋 Paste your JSON from Supabase SQL Editor:"
echo "(Press Ctrl+D when done)"
echo ""

# Read from stdin and save to file
cat > "$FILENAME"

# Try to format if it's valid JSON
if command -v jq &> /dev/null; then
    # Use jq to format JSON if available
    if jq . "$FILENAME" > "${FILENAME}.tmp" 2>/dev/null; then
        mv "${FILENAME}.tmp" "$FILENAME"
        echo "✅ Saved and formatted JSON to: $FILENAME"
    else
        echo "⚠️  Saved to: $FILENAME (not valid JSON, saved as-is)"
    fi
else
    # Check if it's valid JSON using node
    if node -e "JSON.parse(require('fs').readFileSync('$FILENAME', 'utf8'))" 2>/dev/null; then
        node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('$FILENAME','utf8')); fs.writeFileSync('$FILENAME', JSON.stringify(data, null, 2))"
        echo "✅ Saved and formatted JSON to: $FILENAME"
    else
        echo "⚠️  Saved to: $FILENAME (may need manual formatting)"
    fi
fi




