#!/usr/bin/env bash
# Cloudflare CLI wrapper for the personal Watch-Buddy account.
# Delegates to the wrangler_personal zsh alias (~/.zshrc) so secrets stay out of the repo.
# npm scripts and agents invoke this because they don't load shell aliases directly.
set -euo pipefail
quoted=$(printf ' %q' "$@")
exec zsh -ic "wrangler_personal${quoted}"
