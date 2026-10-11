#!/usr/bin/env bash
# Push /opt/dsh to GitHub as a branch under ops/ and print the pull-request link.
#   bash push-pr.sh key    → make a deploy key, print it (add on GitHub with write access)
#   bash push-pr.sh push   → commit, push branch, print PR link
set -euo pipefail
REPO=Deji147x/dadstillhere.com-landingpage; K=/root/.ssh/dsh_deploy; BR=ops-$(date +%F)
if [ "${1:-}" = key ]; then
  [ -f $K ] || ssh-keygen -t ed25519 -N '' -C "dsh-vps-deploy" -f $K -q
  grep -q 'Host github-dsh' /root/.ssh/config 2>/dev/null || printf 'Host github-dsh\n  HostName github.com\n  User git\n  IdentityFile %s\n  IdentitiesOnly yes\n' $K >> /root/.ssh/config
  chmod 600 /root/.ssh/config; ssh-keyscan -q github.com >> /root/.ssh/known_hosts 2>/dev/null
  echo "Add this on GitHub → repo → Settings → Deploy keys → Add deploy key, tick 'Allow write access':"; echo; cat $K.pub; exit 0
fi
command -v git >/dev/null || apt-get install -y -qq git >/dev/null
A=$(ssh -T github-dsh 2>&1 || true); echo "$A" | grep -qi "authenticated" || { echo "deploy key not accepted: $A"; exit 1; }
cp -p /usr/local/bin/dsh-* /usr/local/bin/ths /opt/dsh/ops-bin/ 2>/dev/null || true
mkdir -p /opt/dsh/ops-cron; cp -p /root/dsh.cron /opt/dsh/ops-cron/dsh.cron
W=$(mktemp -d); git clone -q --depth 50 git@github-dsh:$REPO.git $W; cd $W
git config user.name "Dad Still Here ops"; git config user.email "support@dadstillhere.com"
git checkout -q -B $BR
mkdir -p ops; rsync -a --delete --exclude '.git' --exclude '*.env' --exclude 'incoming/' --exclude 'node_modules/' /opt/dsh/ ops/
cat > ops/.gitignore <<'EOF'
*.env
!*.env.example
incoming/
EOF
git add -A ops
if git diff --cached --name-only | xargs -r grep -lE 'EAA[A-Za-z0-9]{40,}|TH[A-Za-z0-9]{60,}|hcw_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}' 2>/dev/null | grep -vE 'audit\.sh|freeze-release\.sh|push-pr\.sh'; then echo "SECRET FOUND in the files above — not pushing"; exit 1; fi
git commit -qm "Ops release $(date +%F): automation, content to owner facts, SEO + security hardening" -m "$(sed -n '1,60p' /opt/dsh/RELEASE-2026-10-10.md 2>/dev/null)" || { echo "nothing changed"; exit 0; }
git push -q -u origin $BR --force
echo "pushed $BR ($(git rev-parse --short HEAD), $(git diff --stat HEAD~1 | tail -1))"
echo "Open the pull request:  https://github.com/$REPO/compare/main...$BR?expand=1"
cd /; rm -rf $W
