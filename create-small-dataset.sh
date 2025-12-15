#!/bin/bash

# Script to create a small subset of data.sql for testing

INPUT_FILE="data/data.sql"
OUTPUT_FILE="data/data-small.sql"

# Get the schema part (everything before the first COPY)
SCHEMA_END=$(grep -n "^COPY public" "$INPUT_FILE" | head -1 | cut -d: -f1)
head -n $((SCHEMA_END - 1)) "$INPUT_FILE" > "$OUTPUT_FILE"

# Extract small samples from each table
echo "" >> "$OUTPUT_FILE"
echo "-- Small sample data for testing" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Collections (take first 5)
echo "COPY public.collections (id, name, slug) FROM stdin;" >> "$OUTPUT_FILE"
sed -n '771,776p' "$INPUT_FILE" >> "$OUTPUT_FILE"
echo "\\." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Categories (take first 20)
echo "COPY public.categories (slug, name, collection_id, image_url) FROM stdin;" >> "$OUTPUT_FILE"
sed -n '214,233p' "$INPUT_FILE" >> "$OUTPUT_FILE"
echo "\\." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Find subcollections section
SUBCATEGORIES_START=$(grep -n "^COPY public.subcategories" "$INPUT_FILE" | head -1 | cut -d: -f1)
SUBCATEGORIES_END=$(grep -n "^\\\\\\.$" "$INPUT_FILE" | awk -v start="$SUBCATEGORIES_START" '$1 > start {print $1; exit}' | cut -d: -f1)

# Subcollections (take first 10)
SUBS_START=$(grep -n "^COPY public.subcollections" "$INPUT_FILE" | head -1 | cut -d: -f1)
SUBS_END=$(grep -n "^\\\\\\.$" "$INPUT_FILE" | awk -v start="$SUBS_START" '$1 > start {print $1; exit}' | cut -d: -f1)
echo "COPY public.subcollections (id, name, category_slug) FROM stdin;" >> "$OUTPUT_FILE"
sed -n "$((SUBS_START+1)),$((SUBS_START+10))p" "$INPUT_FILE" >> "$OUTPUT_FILE"
echo "\\." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Subcategories (take first 20)
echo "COPY public.subcategories (slug, name, subcollection_id, image_url) FROM stdin;" >> "$OUTPUT_FILE"
sed -n "$((SUBCATEGORIES_START+1)),$((SUBCATEGORIES_START+20))p" "$INPUT_FILE" >> "$OUTPUT_FILE"
echo "\\." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Products (take first 100)
echo "COPY public.products (slug, name, description, price, subcategory_slug, image_url) FROM stdin;" >> "$OUTPUT_FILE"
sed -n '798,897p' "$INPUT_FILE" >> "$OUTPUT_FILE"
echo "\\." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Add sequence resets at the end
echo "-- Reset sequences" >> "$OUTPUT_FILE"
echo "SELECT setval('public.collections_id_seq', (SELECT MAX(id) FROM public.collections));" >> "$OUTPUT_FILE"
echo "SELECT setval('public.subcollections_id_seq', (SELECT MAX(id) FROM public.subcollections));" >> "$OUTPUT_FILE"
echo "SELECT setval('public.users_id_seq', 1);" >> "$OUTPUT_FILE"

echo "✅ Created $OUTPUT_FILE with small dataset"
echo "📊 Contains:"
echo "   - 5 collections"
echo "   - 20 categories"
echo "   - 10 subcollections"
echo "   - 20 subcategories"
echo "   - 100 products"

