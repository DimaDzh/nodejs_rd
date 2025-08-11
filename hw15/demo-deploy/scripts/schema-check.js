const { execSync } = require('child_process');
const path = require('path');

async function checkSchema() {
  try {
    console.log('🔍 Checking schema consistency...');

    // Use schema:log to check for differences
    let schemaOutput;
    try {
      // Try with regular npx first
      schemaOutput = execSync('npx typeorm schema:log -d src/data-source.ts', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
      });
    } catch (firstError) {
      try {
        // Try with ts-node-esm
        schemaOutput = execSync(
          'npx ts-node-esm ./node_modules/typeorm/cli.js schema:log -d src/data-source.ts',
          {
            cwd: path.join(__dirname, '..'),
            encoding: 'utf8',
          },
        );
      } catch (secondError) {
        console.error('❌ Failed to check schema:', secondError.message);
        process.exit(1);
      }
    }

    // Parse the output to check for schema changes
    const lines = schemaOutput.split('\n');
    const sqlQueries = lines.filter(
      (line) =>
        line.trim().startsWith('ALTER') ||
        line.trim().startsWith('CREATE') ||
        line.trim().startsWith('DROP') ||
        line.trim().startsWith('UPDATE') ||
        line.trim().startsWith('INSERT'),
    );

    if (sqlQueries.length > 0) {
      console.error('❌ Schema differences detected!');
      console.error('📋 Pending schema changes:');
      sqlQueries.forEach((query) => {
        console.error(`   ${query.trim()}`);
      });
      console.error(
        '💡 Run `pnpm migration:generate --name=YourMigrationName` to create a migration for these changes.',
      );
      process.exit(1);
    }

    // Check if output contains "No changes in database schema were found" or similar
    if (
      schemaOutput.includes('queries (0)') ||
      schemaOutput.includes('No schema changes') ||
      schemaOutput.includes('schema is up to date') ||
      schemaOutput.includes('no queries to be executed')
    ) {
      console.log('✅ Schema is consistent with the database');
      process.exit(0);
    }

    console.log('✅ Schema check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema check script failed:', error.message);
    process.exit(1);
  }
}

// Run the schema check
checkSchema();
