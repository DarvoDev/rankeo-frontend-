#!/bin/sh
# docs/docs.sh map    -> "símbolo<TAB>archivo" (esqueleto de la tabla de MAP.md)
# docs/docs.sh stale  -> docs cuyas fuentes cambiaron desde su rev
# Ejecutar desde la raíz del repo: sh docs/docs.sh map
case "$1" in
map)
  grep -rn --include='*.ts' --include='*.tsx' \
    -E '^export (default )?(async )?function |^export (const|class|interface|type) ' src \
    | grep -v '\.test\.ts' \
    | sed -E 's/^([^:]+):[0-9]+:export (default )?(async )?(function|const|class|interface|type) ([A-Za-z0-9_]+).*/\5 \1/' \
    | awk '{print $1"\t"$2}' | sort -u ;;
stale)
  for f in $(grep -rl '<!-- fuente:' docs); do
    rev=$(sed -n 's/.*rev: \([0-9a-f]*\).*/\1/p' "$f" | head -1)
    src=$(sed -n 's/.*fuente: \([^|]*\).*/\1/p' "$f" | head -1 | tr ',' ' ')
    [ -n "$rev" ] && git diff --name-only "$rev"..HEAD -- $src | grep -q . && echo "STALE: $f"
  done; true ;;
*) echo "uso: sh docs/docs.sh map|stale" ;;
esac
