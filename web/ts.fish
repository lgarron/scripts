#!/usr/bin/env -S fish --no-config

if not set -q argv[1]
  echo "Usage: ts <path/to/file.ts>"
  echo ""
  echo "Compiles to a temporary bundle using `esbuild` and runs using `node`."
  echo "Uses source maps to give nice stack traces!"
  exit 0
end

# TODO: arg for pure script output (no compile/header output)

set SRC_ENTRY $argv[1]
set SRC_ENTRY_REALPATH (realpath $SRC_ENTRY)

set TEMP_FOLDER (mktemp -d)
# cd so that `esbuild` uses relative paths for source maps that `node` maps properly.
cd $TEMP_FOLDER

echo "{\"type\": \"module\"}" > package.json

echo "import \"$SRC_ENTRY_REALPATH\";" > main.ts
echo ""
echo "------- [ts] Compiling with `esbuild` ---------"
echo ""
npx esbuild --bundle --splitting --format=esm --target=esnext main.ts --sourcemap --platform=node --outdir=.

echo ""
echo "------- [ts] Running in `node` ---------"
echo ""
node --enable-source-maps main.js $argv[2..-1]

rm -rf $TEMP_FOLDER
