#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const GIT_HOOKS_DIR = path.join(ROOT_DIR, '.git', 'hooks');
const PRE_COMMIT_HOOK = path.join(GIT_HOOKS_DIR, 'pre-commit');
const HOOK_SCRIPT_PATH = path.join(__dirname, 'pre-commit-hook.sh');

/**
 * Install the pre-commit hook
 */
function installHook() {
  try {
    // Check if .git/hooks directory exists
    if (!fs.existsSync(GIT_HOOKS_DIR)) {
      console.error('✗ .git/hooks directory not found. Are you in a git repository?');
      process.exit(1);
    }

    // Create the pre-commit hook script
    const hookContent = `#!/bin/bash
# Auto-generated pre-commit hook for verifying tools list
# This hook ensures the tools list is always up to date before committing

set -e

# Run the tools list update script
node scripts/update-tools-list.js

# Check if index.html was modified
if git diff --quiet index.html; then
  # No changes, nothing to do
  exit 0
else
  # index.html was modified, add it to the staging area
  git add index.html
  echo "✓ Updated index.html with latest tools list"
fi
`;

    fs.writeFileSync(PRE_COMMIT_HOOK, hookContent, { mode: 0o755 });

    console.log('✓ Pre-commit hook installed successfully');
    console.log(`  Location: ${PRE_COMMIT_HOOK}`);
    console.log('');
    console.log('The hook will:');
    console.log('  1. Run the tools list update script before each commit');
    console.log('  2. Automatically add index.html if it needs updating');
    console.log('');
    console.log('To uninstall the hook, delete: ' + PRE_COMMIT_HOOK);
  } catch (error) {
    console.error('✗ Error installing pre-commit hook:', error.message);
    process.exit(1);
  }
}

// Run the installation
installHook();
