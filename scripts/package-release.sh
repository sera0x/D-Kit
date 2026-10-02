#!/usr/bin/env bash
# Builds the release bundle that install.sh downloads: a self-contained
# dkit-cli tarball (dependencies included, so npm is not needed on the
# install machine) plus checksums.txt, written to releases/. Run from the
# repo root:
#   ./scripts/package-release.sh [version]
# Version defaults to the one in cli/package.json. Upload both files to a
# GitHub release tagged v<version>.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE="dkit-cli"
OUT_DIR="$ROOT/releases"

VERSION="${1:-$(node -p "require('$ROOT/cli/package.json').version")}"
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$OUT_DIR"

mkdir "$STAGE/$BUNDLE"
cp -r "$ROOT/cli/bin" "$ROOT/cli/lib" "$ROOT/cli/templates" "$STAGE/$BUNDLE/"
cp "$ROOT/cli/package.json" "$ROOT/cli/README.md" "$STAGE/$BUNDLE/"
find "$STAGE/$BUNDLE" -type d -name node_modules -prune -exec rm -rf {} +

# Install production dependencies into the bundle so the tarball is
# self-contained: node, curl and tar are all install.sh needs.
cd "$STAGE/$BUNDLE"
npm install --omit=dev --silent --no-audit --no-fund

TARBALL="$OUT_DIR/${BUNDLE}-${VERSION}.tar.gz"
tar -czf "$TARBALL" -C "$STAGE" "$BUNDLE"

cd "$OUT_DIR"
sha256sum "$(basename "$TARBALL")" > checksums.txt

echo "Packaged cli@$VERSION:"
echo "  $TARBALL ($(du -h "$TARBALL" | cut -f1))"
echo "  $OUT_DIR/checksums.txt"
echo ""
echo "Create the GitHub release (tag v$VERSION) and upload both files."
