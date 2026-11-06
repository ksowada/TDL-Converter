#!/usr/bin/env bash
# run.sh - CLI transformation of a .tdl file using Saxon HE (Java)
#
# Usage:
#   ./run.sh [input.tdl] [tdl2html.xsl|tdl2md.xsl] [output_file]
#
# Examples:
#   ./run.sh input.tdl tdl2html.xsl output.html
#   ./run.sh input.tdl tdl2md.xsl output.md

set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    echo "Usage: ./run.sh [input_file] [xsl_stylesheet] [output_file]"
    echo ""
    echo "Arguments:"
    echo "  input_file      Path to .tdl or .xml file (default: input.tdl)"
    echo "  xsl_stylesheet  XSL stylesheet name or path (default: tdl2html.xsl)"
    echo "                  Options: tdl2html.xsl (HTML) or tdl2md.xsl (Markdown)"
    echo "  output_file     Path for output file (default: output.html or output.md)"
    echo ""
    echo "Prerequisites:"
    echo "  Java and Saxon HE JAR must be installed."
    echo "  Set SAXON_JAR environment variable, e.g.:"
    echo "    export SAXON_JAR=/path/to/saxon-he-12.jar"
    exit 0
fi

DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"

if [ -z "${SAXON_JAR:-}" ]; then
    echo "Error: Environment variable SAXON_JAR is not set." >&2
    echo "Please point SAXON_JAR to your Saxon-HE .jar file, for example:" >&2
    echo "  export SAXON_JAR=/usr/share/java/saxon-he.jar" >&2
    exit 1
fi

INPUT="${1:-$DIR/input.tdl}"
XSL_NAME="${2:-tdl2html.xsl}"

# Resolve XSL path relative to script directory if not absolute
if [[ "$XSL_NAME" = /* ]]; then
    XSL="$XSL_NAME"
else
    XSL="$DIR/$XSL_NAME"
fi

# Smart default output extension matching stylesheet
if [ -n "${3:-}" ]; then
    OUTPUT="$3"
elif [[ "$XSL_NAME" == *"md"* ]]; then
    OUTPUT="$DIR/output.md"
else
    OUTPUT="$DIR/output.html"
fi

echo "▶ Transforming: $INPUT"
echo "  Stylesheet:   $XSL"
echo "  Output:       $OUTPUT"

java -classpath "$SAXON_JAR" net.sf.saxon.Transform -t -s:"$INPUT" -xsl:"$XSL" -o:"$OUTPUT"

echo "✔ Successfully generated $OUTPUT"