#!/usr/bin/env bash
# OCA CI Fix CLI Shim
# Routes Odoo CE/OCA repository snapshots to the CI Guardian agent

set -euo pipefail

# Root of your Odoo CE repo
REPO_ROOT="${1:-$PWD}"

cd "$REPO_ROOT"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Odoo CE/OCA CI Guardian${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Repository: $REPO_ROOT"
echo ""

# Snapshot the important bits for the agent
TMP_SNAPSHOT="$(mktemp)"
{
  echo "# Repository Snapshot for odoo-oca-ci-fixer"
  echo "# Generated: $(date -Iseconds)"
  echo "# Repository: $REPO_ROOT"
  echo ""

  echo "## Repository Tree"
  git ls-files | sed 's/^/  /'

  echo ""
  echo "## GitHub Workflows"
  if [ -d .github/workflows ]; then
    for workflow in .github/workflows/*.yml; do
      if [ -f "$workflow" ]; then
        echo "### $(basename "$workflow")"
        sed -n '1,200p' "$workflow"
        echo ""
      fi
    done
  else
    echo "No .github/workflows directory found"
  fi

  echo ""
  echo "## Module Manifests"
  find addons platform/odoo/addons odoo/addons -maxdepth 3 -name "__manifest__.py" -print \
    -exec echo "### {}" \; \
    -exec sed -n '1,80p' {} \; 2>/dev/null || echo "No addons found"

  echo ""
  echo "## Requirements"
  if [ -f requirements.txt ]; then
    echo "### requirements.txt"
    cat requirements.txt
  fi

  echo ""
  echo "## Recent CI Failures (if any)"
  if [ -f .github/workflows/ci.log ]; then
    echo "### CI Log"
    tail -100 .github/workflows/ci.log
  else
    echo "No CI logs found (expected location: .github/workflows/ci.log)"
  fi

} > "$TMP_SNAPSHOT"

echo -e "${GREEN}✓${NC} Snapshot created: $TMP_SNAPSHOT"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Next steps:"
echo ""
echo "1. Copy snapshot to clipboard:"
echo "   cat $TMP_SNAPSHOT | pbcopy  # macOS"
echo "   cat $TMP_SNAPSHOT | xclip -selection clipboard  # Linux"
echo ""
echo "2. Invoke the agent:"
echo "   claude-agent run odoo-oca-ci-fixer < $TMP_SNAPSHOT"
echo ""
echo "3. Or paste directly into Claude Code with:"
echo "   @odoo-oca-ci-fixer [paste snapshot]"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Show preview
echo ""
echo "Snapshot preview (first 50 lines):"
echo ""
head -50 "$TMP_SNAPSHOT"
echo ""
echo "... (full snapshot: $TMP_SNAPSHOT)"
echo ""

# Optionally auto-invoke if claude-agent is available
if command -v claude-agent &> /dev/null; then
  read -p "Invoke odoo-oca-ci-fixer agent now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Invoking agent..."
    claude-agent run odoo-oca-ci-fixer < "$TMP_SNAPSHOT"
  fi
else
  echo "Note: Install claude-agent CLI for direct invocation"
fi

# Keep temp file for manual use
echo "Snapshot saved to: $TMP_SNAPSHOT"
echo "(Will be cleaned up on next reboot)"
