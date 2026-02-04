require('dotenv/config');
const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(`SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'session'::regclass`);
    console.log('constraints on session:', JSON.stringify(res.rows, null, 2));

    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('tables:', JSON.stringify(tables.rows, null, 2));

    const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='session'");
    console.log('session columns:', JSON.stringify(cols.rows, null, 2));

    const cons = await client.query("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name='session'");
    console.log('session constraints:', JSON.stringify(cons.rows, null, 2));

    // Attempt to inspect user(s) table
    const userExists = await client.query("SELECT to_regclass('public.user') as user_exists, to_regclass('public.users') as users_exists");
    console.log('user table exists:', JSON.stringify(userExists.rows, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();