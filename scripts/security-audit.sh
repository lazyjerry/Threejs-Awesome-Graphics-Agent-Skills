#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-$(pwd)}"
cd "$repo_root"

echo "SCAN_ROOT=$PWD"
echo "== counts =="
printf 'skills_files=%s\n' "$(find skills -type f | wc -l | tr -d ' ')"
printf 'skills_markdown=%s\n' "$(find skills -type f -name '*.md' | wc -l | tr -d ' ')"
printf 'repo_markdown=%s\n' "$(find . -path './.git' -prune -o -path './node_modules' -prune -o -type f -name '*.md' -print | wc -l | tr -d ' ')"
printf 'symlinks=%s\n' "$(find skills -type l | wc -l | tr -d ' ')"

echo "== symlinks =="
find skills -type l -print -exec readlink {} \;

echo "== executable files =="
find skills bin scripts -type f -perm -111 -print 2>/dev/null || true

echo "== hidden unicode =="
rg -n --hidden -P '[\x{200B}\x{200C}\x{200D}\x{FEFF}\x{2060}]' skills . -g '*.md' -g '*.yaml' -g '*.yml' -g '*.js' -g '*.mjs' -g '*.ts' 2>/dev/null || true

echo "== security candidates =="
rg -n -i --hidden \
  -g '*.md' -g '*.yaml' -g '*.yml' -g '*.js' -g '*.mjs' -g '*.ts' -g '*.sh' \
  -e 'ignore (all |the )?(previous|prior)' -e 'disregard your instructions' -e 'override your system prompt' \
  -e 'you are now' -e 'jailbreak' -e 'developer mode' -e 'when the user says' -e 'secretly' \
  -e '(^|[^[:alnum:]_])(eval|exec|subprocess|child_process|os\.system)[[:space:]]*[( ]' \
  -e 'curl[^\n|]*\|[[:space:]]*(bash|sh)' -e 'wget[^\n|]*\|[[:space:]]*(bash|sh)' \
  -e '(^|[^[:alnum:]_])(sudo|chmod[[:space:]]+777|rm[[:space:]]+-rf)' \
  -e '(~?/\.ssh|\.aws/credentials|\.config/gcloud|(^|/)(\.env|\.env\.local)|id_rsa|\.(pem|key))' \
  -e '(curl|wget|fetch|axios|http\.request)[^\n]*(https?://)' \
  -e '(telemetry|analytics|tracking|webhook|installation_id|device_id|analytics_id|uuidgen|randomUUID|printenv)' \
  -e '(\.bashrc|\.zshrc|CLAUDE\.md|AGENTS\.md|settings\.json)' \
  skills bin scripts README.md source_materials dev 2>/dev/null || true

echo "== package lifecycle and dependencies =="
node -e "const p=require('./package.json'); console.log(JSON.stringify({scripts:p.scripts,dependencies:p.dependencies||{},devDependencies:p.devDependencies||{}},null,2))" 2>/dev/null || true
if command -v npm >/dev/null 2>&1; then npm audit --json --package-lock-only 2>/dev/null || echo 'npm_audit=unavailable_or_failed'; fi

echo "== large files =="
find skills -type f -size +50k -print

echo "== file types =="
find skills -type f -print0 | xargs -0 file | sed -n '1,240p'
