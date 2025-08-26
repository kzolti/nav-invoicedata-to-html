
set -e

# Fájlnevek (forrás, cél)
FILES=(
  "invoiceTemplate"
)

for FILE in "${FILES[@]}"; do
  TEMPLATE_PATH="src/hndlbrs/${FILE}.hbs"
  GEN_PATH="src/hndlbrs/gen/${FILE}.js.bak"
  FIXED_PATH="src/hndlbrs/gen/${FILE}_fixed.js"

  # 1. Generálás
  npx handlebars "$TEMPLATE_PATH" -f "$GEN_PATH" --commonjs

  # 2. Átalakítás javított verzióra
  {
    echo "const Handlebars = require('handlebars/runtime');"
    echo "const customHelpers = require('../helpers');"
    echo ""
    echo "// Helper regisztrálás"
    echo "Object.entries(customHelpers).forEach(([name, fn]) => Handlebars.registerHelper(name, fn));"
    echo ""
    echo "var template = Handlebars.template;"
    echo "var templates = {};"
    echo ""
    head -n -1 "$GEN_PATH" | tail -n +3
    echo ""
    echo "module.exports = templates;"
  } > "$FIXED_PATH"

  echo "✅ Kész: $FIXED_PATH létrehozva."
done
