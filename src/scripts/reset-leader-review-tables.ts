import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables manually since we are not in Nest context
const envPath = resolve(__dirname, '../../env/dev.env');
dotenv.config({ path: envPath });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT_POOL || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'hrams',
  entities: [],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function resetTables() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected!');

    const tablesToDrop = [
      'leader_review_response', // The orphan table causing issues
      'review_answers',         // New table
      'template_question',      // New table name (check check)
      'leader_review_question', // Old table name potentially
      'leader_review_template',
      'review_assignment',
      'leader_review'
    ];

    console.log('Dropping tables with Cascade...');
    for (const table of tablesToDrop) {
        // Use CASCADE to remove constraints
        await dataSource.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Dropped table: ${table}`);
    }

    console.log('Successfully reset Leader Review tables.');
  } catch (error) {
    console.error('Error resetting tables:', error);
  } finally {
    await dataSource.destroy();
  }
}

resetTables();
