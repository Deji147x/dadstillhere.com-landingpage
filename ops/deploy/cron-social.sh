#!/bin/bash
exec 9>/var/lock/dsh-social.lock
flock -n 9 || exit 0
cd /opt/dsh
echo "── $(date -Is) social"
SLUG=$(node -e "const p=require('/opt/dsh/content/posts.json');const t=new Date().toISOString().slice(0,10);const x=p.find(e=>e.date===t);process.stdout.write(x?x.slug:'')")
[ -z "$SLUG" ] && { echo "no entry today"; exit 0; }
node tools/social-kit.mjs
node tools/make-cards.mjs --yes --slug "$SLUG"
node tools/post-social.mjs --slug "$SLUG"
