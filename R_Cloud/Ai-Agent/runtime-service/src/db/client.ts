/**
 * src/db/client.ts
 *
 * DATABASE CLIENT — PostgreSQL connection setup.
 *
 * Responsibilities:
 *  - Initialize and export the PostgreSQL client instance
 *  - Use Drizzle ORM (recommended) or Prisma for type-safe queries
 *  - Read the DATABASE_URL from config
 *  - Export a connect() and disconnect() function for lifecycle management
 *  - Apply connection pooling settings:
 *      - min: 2 connections
 *      - max: 10 connections
 *      - idle timeout: 30 seconds
 *
 * Why Drizzle ORM?
 *  - Full TypeScript type safety from schema to query result
 *  - No code generation step (unlike Prisma)
 *  - Lightweight, SQL-first approach
 *  - Works well with the schema/ folder structure
 *
 * Usage across the service:
 *  import { db } from '@/db/client';
 *  const runtimes = await db.select().from(schema.runtimes).where(...);
 */
