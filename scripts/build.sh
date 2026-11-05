#!/usr/bin/env bash
# Build the TDL Converter web app into ./dist
#  1. compile the XSLT stylesheets to SaxonJS SEF files (xslt3)
#  2. copy everything needed at runtime into dist/
set -euo pipefail

ROOT="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
cd "$ROOT"

echo "▶ Compiling XSLT → SEF"
npx xslt3 -xsl:tdl2html.xsl -export:todo2html.sef.json -nogo
npx xslt3 -xsl:tdl2md.xsl   -export:todo2md.sef.json   -nogo

echo "▶ Assembling dist/"
rm -rf dist
mkdir -p dist/saxonjs3
cp index.html app.js style.css logo.webp TDL-Converter.splash.webp todo2html.sef.json todo2md.sef.json LICENSE.md dist/
cp saxonjs3/SaxonJS3.rt.js saxonjs3/LICENSE.txt dist/saxonjs3/

echo "✔ Build finished:"
du -sh dist
