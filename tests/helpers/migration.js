const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'supabase', 'migrations');
const SCHEMA_MIGRATION_PATH = path.join(MIGRATIONS_DIR, '20250703000000_initial_schema.sql');
const RLS_MIGRATION_PATH = path.join(MIGRATIONS_DIR, '20260703150033_rls_policies.sql');

function readMigration() {
  return fs.readFileSync(SCHEMA_MIGRATION_PATH, 'utf-8');
}

function readRlsMigration() {
  return fs.readFileSync(RLS_MIGRATION_PATH, 'utf-8');
}

function readMigrationFile(filename) {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf-8');
}

function extractCreateTable(sql, tableName) {
  const pattern = new RegExp(
    `CREATE TABLE\\s+(?:IF NOT EXISTS\\s+)?(?:public\\.)?${tableName}\\s*\\((.*?)\\);`,
    'is'
  );
  const match = sql.match(pattern);
  return match ? match[1] : null;
}

function extractCreateIndex(sql, tableName, columns) {
  const columnPart = Array.isArray(columns) ? columns.join('\\s*,\\s*') : columns;
  const pattern = new RegExp(
    `CREATE INDEX\\s+(?:IF NOT EXISTS\\s+)?\\w+\\s+ON\\s+(?:public\\.)?${tableName}\\s*\\(\\s*${columnPart}\\s*\\);`,
    'i'
  );
  return sql.match(pattern);
}

function hasFunctionalTagIndex(sql) {
  return /CREATE INDEX\s+IF NOT EXISTS\s+idx_tags_nome_norm\s+ON\s+(?:public\.)?tags\s*\(\s*lower\s*\(\s*(?:public\.)?f_unaccent\s*\(\s*nome_tag\s*\)\s*\)\s*\)/i.test(sql);
}

function hasRlsEnabled(sql, tableName) {
  const pattern = new RegExp(
    `alter\\s+table\\s+(?:public\\.)?${tableName}\\s+enable\\s+row\\s+level\\s+security`,
    'i'
  );
  return pattern.test(sql);
}

function extractPolicy(sql, tableName, action) {
  const pattern = new RegExp(
    `create\\s+policy\\s+"?\\w+"?\\s+on\\s+(?:public\\.)?${tableName}\\s+for\\s+${action}\\s+to\\s+([\\w,\\s]+?)\\s*(?:using\\s*\\((.*?)\\)\\s*)?(?:with\\s+check\\s*\\((.*?)\\)\\s*)?;`,
    'is'
  );
  const match = sql.match(pattern);
  if (!match) return null;
  return {
    to: match[1].trim(),
    using: match[2] ? match[2].trim() : null,
    withCheck: match[3] ? match[3].trim() : null,
  };
}

function hasGrant(sql, tableName, privilege, role) {
  const pattern = new RegExp(
    `grant\\s+[\\w,\\s]*?\\b${privilege}\\b[\\w,\\s]*?\\s+on\\s+table\\s+(?:public\\.)?${tableName}\\s+to\\s+${role}`,
    'i'
  );
  return pattern.test(sql);
}

function hasRevoke(sql, tableName, privilege, role) {
  const pattern = new RegExp(
    `revoke\\s+[\\w,\\s]*?\\b${privilege}\\b[\\w,\\s]*?\\s+on\\s+table\\s+(?:public\\.)?${tableName}\\s+from\\s+${role}`,
    'i'
  );
  return pattern.test(sql);
}

module.exports = {
  readMigration,
  readRlsMigration,
  readMigrationFile,
  extractCreateTable,
  extractCreateIndex,
  hasFunctionalTagIndex,
  hasRlsEnabled,
  extractPolicy,
  hasGrant,
  hasRevoke
};
