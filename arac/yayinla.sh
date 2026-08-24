#!/bin/bash
# MasalPark yayın hattı: yayinla.sh "commit mesajı" [dosya...]
# pull --rebase → commit (heroharun) → push → deploy izle → canlı doğrula
set -e
MESAJ="$1"; shift || true
[ -z "$MESAJ" ] && { echo "kullanım: arac/yayinla.sh \"mesaj\" [dosya...]"; exit 1; }
cd "$(dirname "$0")/.."
git stash -q 2>/dev/null || true
git pull --rebase origin main 2>&1 | tail -1
git stash pop -q 2>/dev/null || true
if [ $# -gt 0 ]; then git add "$@"; else git add -A; fi
git commit -q -m "$MESAJ" --author="heroharun <buyuktepe.hhhes@gmail.com>"
git push -q origin main
HEDEF=$(git rev-parse --short HEAD); echo "HEDEF=$HEDEF"
for i in $(seq 1 30); do
  DURUM=$(gh run list --repo heroharun/oyunlar --limit 5 --json headSha,status,conclusion \
    --jq ".[]|select(.headSha|startswith(\"$HEDEF\"))|\"\(.status) \(.conclusion)\"" 2>/dev/null | head -1)
  [ "$DURUM" = "completed success" ] && { echo "DEPLOY OK"; exit 0; }
  echo "$DURUM" | grep -q completed && { echo "DEPLOY SORUN: $DURUM"; exit 1; }
  sleep 12
done
echo "DEPLOY ZAMAN AŞIMI"; exit 1
