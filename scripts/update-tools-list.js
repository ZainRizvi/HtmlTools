#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT_DIR, 'index.html');
const BASE_URL = '/';
const DESCRIPTION_REGEX =
  /<meta[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i;

/**
 * Discover all tools in the root directory
 * A tool is any .html file that is not index.html
 */
function discoverTools() {
  const files = fs.readdirSync(ROOT_DIR);
  const tools = files
    .filter(file => file.endsWith('.html') && file !== 'index.html')
    .sort();

  return tools;
}

/**
 * Convert filename to display name
 * e.g., "svg-arc-generator.html" -> "SVG Arc Generator"
 */
function filenameToDisplayName(filename) {
  const acronyms = ['svg', 'json', 'html', 'css', 'js', 'xml', 'api', 'url', 'qr', 'rgb'];

  return filename
    .replace(/\.html$/, '') // Remove .html extension
    .split('-')
    .map(word => {
      if (acronyms.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Generate HTML list items for tools
 */
function generateToolsHtml(tools) {
  if (tools.length === 0) {
    return '            <li><strong>No tools yet.</strong></li>';
  }

  return tools
    .map(tool => {
      const displayName = filenameToDisplayName(tool);
      const description = getDescriptionForTool(tool);
      const url = `${BASE_URL}${tool}`;
      const descSuffix = description
        ? ` <span aria-label="description">— ${escapeHtml(description)}</span>`
        : '';
      return `            <li><a href="${url}">${displayName}</a>${descSuffix}</li>`;
    })
    .join('\n');
}

function getDescriptionForTool(filename) {
  const filePath = path.join(ROOT_DIR, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(DESCRIPTION_REGEX);
    return match ? match[1].trim() : '';
  } catch (error) {
    console.warn(`Warning: could not read description for ${filename}: ${error.message}`);
    return '';
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Update index.html with the current list of tools
 */
function updateIndexHtml() {
  try {
    // Read index.html
    let content = fs.readFileSync(INDEX_PATH, 'utf8');

    // Discover tools
    const tools = discoverTools();
    const toolsHtml = generateToolsHtml(tools);

    // Replace the tools list
    // Match everything between <ul id="tools-list"> and </ul>
    const pattern = /(<ul id="tools-list">)([\s\S]*?)(<\/ul>)/;
    content = content.replace(pattern, `$1\n${toolsHtml}\n          $3`);

    // Write back to index.html
    fs.writeFileSync(INDEX_PATH, content, 'utf8');

    console.log(`✓ Updated tools list in index.html`);
    console.log(`  Found ${tools.length} tool(s): ${tools.join(', ')}`);
  } catch (error) {
    console.error('Error updating index.html:', error.message);
    process.exit(1);
  }
}

// Run the update
updateIndexHtml();
