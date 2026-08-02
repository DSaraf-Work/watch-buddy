#!/usr/bin/env bash
# Fast end-of-turn commit. Agent passes AUTO_COMMIT_TITLE (+ optional BODY).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

status="$(git status --porcelain)"
[[ -z "$status" ]] && exit 0

git add -A
git reset -q HEAD -- .env .env.* 2>/dev/null || true
[[ -z "$(git diff --cached --name-only)" ]] && exit 0

OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.2:1b}"
OLLAMA_TIMEOUT="${OLLAMA_TIMEOUT:-2}"

ollama_up() {
  curl -sf --max-time 1 "$OLLAMA_URL/api/tags" >/dev/null 2>&1
}

start_ollama() {
  if command -v open >/dev/null 2>&1; then
    open -a Ollama >/dev/null 2>&1 || true
  fi
  if ! pgrep -f "ollama serve" >/dev/null 2>&1; then
    nohup ollama serve >/dev/null 2>&1 &
  fi
  for _ in $(seq 1 20); do
    ollama_up && return 0
    sleep 0.25
  done
  return 1
}

sanitize_title() {
  python3 - "$1" <<'PY'
import re, sys
t = (sys.argv[1] if len(sys.argv) > 1 else "").strip()
t = t.splitlines()[0].strip()
t = re.sub(r'^["`\']+|["`\']+$', "", t)
t = re.sub(r'^(TITLE|Subject)\s*:\s*', "", t, flags=re.I)
if not re.match(r"^[a-z]+(\([^)]{1,40}\))?: .{4,}$", t):
    sys.exit(1)
print(t[:72].rstrip())
PY
}

sanitize_body() {
  python3 - "$1" <<'PY'
import re, sys
b = (sys.argv[1] if len(sys.argv) > 1 else "").strip()
b = re.sub(r'^(BODY|Description)\s*:\s*', "", b, flags=re.I)
b = " ".join(line.strip() for line in b.splitlines() if line.strip())
print(b[:240])
PY
}

commit_with() {
  local title="$1" body="${2:-}"
  if [[ -n "$body" ]]; then
    git commit -m "$title" -m "$body"
  else
    git commit -m "$title"
  fi
}

infer_scope() {
  local path scope
  path="$(git diff --cached --name-only | head -1)"
  scope="${path%%/*}"
  [[ "$scope" == "apps" && "$path" == */* ]] && scope="${path#*/}" && scope="${scope%%/*}"
  [[ "$scope" == ".github" ]] && scope="ci"
  [[ "$scope" == ".cursor" ]] && scope="cursor"
  printf '%s' "${scope:-repo}"
}

infer_type() {
  local text="$1"
  local type="chore"
  echo "$text" | grep -qiE '\bfix|bug|broken|error\b' && type="fix"
  echo "$text" | grep -qiE '\btest|spec\b' && type="test"
  echo "$text" | grep -qiE '\bdoc|readme|\.md\b' && type="docs"
  echo "$text" | grep -qiE '\bworkflow|ci|deploy\b' && type="ci"
  echo "$text" | grep -qiE '\bfeat|add\b' && type="feat"
  echo "$text" | grep -qiE '\brefactor\b' && type="refactor"
  printf '%s' "$type"
}

fallback_msg() {
  local scope type done title
  scope="$(infer_scope)"
  done="${AUTO_COMMIT_DONE:-${AUTO_COMMIT_USER:-}}"
  type="$(infer_type "$done $(git diff --cached --name-only | tr '\n' ' ')")"
  done="$(printf '%s' "$done" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | cut -c1-48)"
  [[ -z "$done" ]] && done="update $(git diff --cached --name-only | wc -l | tr -d ' ') files"
  title="${type}(${scope}): ${done}"
  title="$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9()/: -]//g' | cut -c1-72)"
  printf '%s\n' "$title"
}

ollama_msg() {
  local files payload raw title body
  files="$(git diff --cached --name-only | head -12 | tr '\n' ', ')"
  payload="$(FILES="$files" OLLAMA_MODEL="$OLLAMA_MODEL" \
    AUTO_COMMIT_USER="${AUTO_COMMIT_USER:-}" \
    AUTO_COMMIT_DONE="${AUTO_COMMIT_DONE:-}" \
    python3 - <<'PY'
import json, os
prompt = f"""Write ONE git commit for this turn.

STRICT RULES:
- TITLE: type(scope): imperative specific change (max 72 chars, no period)
- BODY: 1 short line: what changed. Optional 2nd line: why (only if needed)
- type: feat|fix|refactor|docs|chore|test|ci|style|perf
- Be specific to the work done, not generic

User asked: {os.environ.get("AUTO_COMMIT_USER", "(unknown)")}
Agent did: {os.environ.get("AUTO_COMMIT_DONE", "(unknown)")}
Files: {os.environ.get("FILES", "")}

Reply exactly:
TITLE: ...
BODY: ..."""
print(json.dumps({
    "model": os.environ["OLLAMA_MODEL"],
    "prompt": prompt,
    "stream": False,
    "options": {"num_predict": 80, "temperature": 0.1},
}))
PY
)"
  raw="$(curl -sf --max-time "$OLLAMA_TIMEOUT" "$OLLAMA_URL/api/generate" \
    -H 'Content-Type: application/json' \
    -d "$payload" 2>/dev/null || true)"
  [[ -z "$raw" ]] && return 1

  parsed="$(printf '%s' "$raw" | python3 -c '
import json, re, sys
try:
    text = json.load(sys.stdin).get("response") or ""
except Exception:
    sys.exit(0)
title = body = ""
for line in text.splitlines():
    line = line.strip()
    if re.match(r"^TITLE\s*:", line, re.I):
        title = re.sub(r"^TITLE\s*:\s*", "", line, flags=re.I).strip()
    elif re.match(r"^BODY\s*:", line, re.I):
        body = re.sub(r"^BODY\s*:\s*", "", line, flags=re.I).strip()
if title:
    print(title)
    print(body)
')"
  title="${parsed%%$'\n'*}"
  body="${parsed#*$'\n'}"
  [[ "$body" == "$title" ]] && body=""
  title="$(sanitize_title "$title" 2>/dev/null || true)"
  [[ -z "$title" ]] && return 1
  body="$(sanitize_body "$body" 2>/dev/null || true)"
  printf '%s\n%s\n' "$title" "$body"
}

# Fast path: agent supplies title (+ optional body) from turn context
if [[ -n "${AUTO_COMMIT_TITLE:-}" ]]; then
  title="$(sanitize_title "$AUTO_COMMIT_TITLE")"
  body=""
  [[ -n "${AUTO_COMMIT_BODY:-}" ]] && body="$(sanitize_body "$AUTO_COMMIT_BODY")"
  commit_with "$title" "$body"
  exit 0
fi

title="" body=""
if [[ "${AUTO_COMMIT_FAST:-}" != "1" ]]; then
  if ! ollama_up; then start_ollama || true; fi
  if ollama_up; then
    result="$(ollama_msg || true)"
    title="${result%%$'\n'*}"
    body="${result#*$'\n'}"
    [[ "$body" == "$title" ]] && body=""
  fi
fi

if [[ -z "$title" ]]; then
  title="$(fallback_msg)"
fi

commit_with "$title" "$body"
