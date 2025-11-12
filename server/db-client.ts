import pkg from 'pg';
const { Pool } = pkg;

// Create a singleton instance of the PostgreSQL pool
let pool: pkg.Pool | null = null;

export function getDbPool(): pkg.Pool {
  if (!pool) {
    const databaseUrl = process.env['DATABASE_URL'];

    if (!databaseUrl) {
      throw new Error('Missing DATABASE_URL environment variable');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Required for Neon
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
      process.exit(-1);
    });
  }

  return pool;
}

// Helper function to execute a query
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<pkg.QueryResult<T>> {
  const pool = getDbPool();
  return pool.query<T>(text, params);
}

// Helper function to get a client from the pool for transactions
export async function getClient(): Promise<pkg.PoolClient> {
  const pool = getDbPool();
  return pool.connect();
}

// Gracefully close the pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
