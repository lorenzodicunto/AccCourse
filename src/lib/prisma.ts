/**
 * AccCourse Database Layer
 *
 * Dual-mode: detects the DATABASE_URL to choose the right adapter.
 *  - PostgreSQL (postgresql://...) → uses Prisma ORM (production / Docker / Coolify)
 *  - SQLite    (file:...)          → uses libSQL wrapper (local development)
 *
 * Both export the same `prisma` object with identical API so the rest
 * of the codebase doesn't need to care which adapter is active.
 */

const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgresql");

// ═══════════════════════════════════════════════════════════════════════════════
// PRISMA MODE  (Production — PostgreSQL via @prisma/client)
// ═══════════════════════════════════════════════════════════════════════════════

function createPrismaClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as { _prisma: unknown };
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = new PrismaClient();
  }
  return globalForPrisma._prisma;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIBSQL MODE  (Development — SQLite via @libsql/client)
// ═══════════════════════════════════════════════════════════════════════════════

type InArgs = string | number | bigint | ArrayBuffer | null | boolean;
type Row = Record<string, unknown>;

let _libsqlClient: unknown = null;

function getLibsqlClient() {
  if (!_libsqlClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    _libsqlClient = createClient({
      url: process.env.DATABASE_URL || "file:./prisma/dev.db",
    });
  }
  return _libsqlClient as {
    execute: (opts: { sql: string; args: InArgs[] }) => Promise<{ rows: Row[] }>;
    executeMultiple: (sql: string) => Promise<void>;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cuid(): string {
  const ts = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 10);
  return `cl${ts}${r}`;
}

async function query(sql: string, args: InArgs[] = []): Promise<Row[]> {
  const result = await getLibsqlClient().execute({ sql, args });
  return result.rows as unknown as Row[];
}

async function queryOne(sql: string, args: InArgs[] = []): Promise<Row | null> {
  const rows = await query(sql, args);
  return rows[0] || null;
}

async function execute(sql: string, args: InArgs[] = []): Promise<void> {
  await getLibsqlClient().execute({ sql, args });
}

// ─── Where / OrderBy / Select builders ────────────────────────────────────────

function buildWhere(where?: Record<string, unknown>): { clause: string; args: InArgs[] } {
  if (!where || Object.keys(where).length === 0) return { clause: "", args: [] };
  const conditions: string[] = [];
  const args: InArgs[] = [];
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if (value === null) {
      conditions.push(`"${key}" IS NULL`);
    } else {
      conditions.push(`"${key}" = ?`);
      args.push(value as InArgs);
    }
  }
  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    args,
  };
}

function buildOrderBy(orderBy?: Record<string, string> | Record<string, string>[]): string {
  if (!orderBy) return "";
  const items = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts = items.map((item) => {
    const [key, dir] = Object.entries(item)[0];
    return `"${key}" ${dir.toUpperCase()}`;
  });
  return parts.length > 0 ? `ORDER BY ${parts.join(", ")}` : "";
}

function buildSelect(select?: Record<string, unknown>): string {
  if (!select) return "*";
  const fields = Object.entries(select)
    .filter(([, v]) => v === true)
    .map(([k]) => `"${k}"`);
  return fields.length > 0 ? fields.join(", ") : "*";
}

function extractIncludesFromSelect(select?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!select) return undefined;
  const includes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(select)) {
    if (value !== true && value !== false && typeof value === "object" && value !== null) {
      includes[key] = value;
    }
  }
  return Object.keys(includes).length > 0 ? includes : undefined;
}

// ─── JSON Field Parser ────────────────────────────────────────────────────────

const JSON_FIELDS: Record<string, string[]> = {
  Course: ["courseData"],
  SharedCourse: ["courseData"],
};

function parseJsonFields(table: string, row: Row): Row {
  const fields = JSON_FIELDS[table];
  if (!fields) return row;
  const parsed = { ...row };
  for (const field of fields) {
    if (typeof parsed[field] === "string") {
      try { parsed[field] = JSON.parse(parsed[field] as string); } catch { /* keep */ }
    }
  }
  return parsed;
}

// ─── Include Resolver ─────────────────────────────────────────────────────────

const RELATION_MAP: Record<string, { table: string; fk: string; type: "many" | "one" }> = {
  tenant:      { table: '"Tenant"',      fk: "tenantId",       type: "one"  },
  courses:     { table: '"Course"',      fk: "authorId",       type: "many" },
  author:      { table: '"User"',        fk: "authorId",       type: "one"  },
  comments:    { table: '"Comment"',     fk: "sharedCourseId", type: "many" },
  reviewer:    { table: '"Reviewer"',    fk: "reviewerId",     type: "one"  },
  sharedCourse:{ table: '"SharedCourse"',fk: "sharedCourseId", type: "one"  },
  uploader:    { table: '"User"',        fk: "uploadedBy",     type: "one"  },
  users:       { table: '"User"',        fk: "tenantId",       type: "many" },
};

async function resolveIncludes(row: Row, _t: string, includes: Record<string, unknown>): Promise<void> {
  for (const [key, includeOpts] of Object.entries(includes)) {
    if (!includeOpts) continue;
    const opts = typeof includeOpts === "boolean" ? {} : (includeOpts as Record<string, unknown>);
    const rel = RELATION_MAP[key];
    if (!rel) continue;

    if (rel.type === "one") {
      const fkValue = row[rel.fk];
      if (fkValue) {
        let selectClause = "*";
        if (opts.select) {
          const fields = Object.entries(opts.select as Record<string, boolean>).filter(([, v]) => v).map(([k]) => `"${k}"`);
          selectClause = fields.length > 0 ? fields.join(", ") : "*";
        }
        const related = await queryOne(`SELECT ${selectClause} FROM ${rel.table} WHERE id = ?`, [fkValue as InArgs]);
        (row as Record<string, unknown>)[key] = related;
      } else {
        (row as Record<string, unknown>)[key] = null;
      }
    } else {
      const parentId = row.id;
      const orderBy = buildOrderBy(opts.orderBy as Record<string, string>);
      const related = await query(`SELECT * FROM ${rel.table} WHERE "${rel.fk}" = ? ${orderBy}`, [parentId as InArgs]);
      if (opts.include) {
        for (const r of related) await resolveIncludes(r, rel.table, opts.include as Record<string, unknown>);
      }
      (row as Record<string, unknown>)[key] = related;
    }
  }
}

// ─── Model Factory (libSQL) ──────────────────────────────────────────────────

function createModel(table: string) {
  const q = `"${table}"`;
  return {
    async findMany(opts?: Record<string, unknown>): Promise<Row[]> {
      const { clause, args } = buildWhere(opts?.where as Record<string, unknown>);
      const select = buildSelect(opts?.select as Record<string, unknown>);
      const orderBy = buildOrderBy(opts?.orderBy as Record<string, string>);
      const rows = await query(`SELECT ${select} FROM ${q} ${clause} ${orderBy}`.trim(), args);
      const parsed = rows.map((r) => parseJsonFields(table, r));
      const includes = (opts?.include || extractIncludesFromSelect(opts?.select as Record<string, unknown>)) as Record<string, unknown> | undefined;
      if (includes) for (const r of parsed) await resolveIncludes(r, table, includes);
      return parsed;
    },

    async findFirst(opts?: Record<string, unknown>): Promise<Row | null> {
      const { clause, args } = buildWhere(opts?.where as Record<string, unknown>);
      const select = buildSelect(opts?.select as Record<string, unknown>);
      const orderBy = buildOrderBy(opts?.orderBy as Record<string, string>);
      const row = await queryOne(`SELECT ${select} FROM ${q} ${clause} ${orderBy} LIMIT 1`.trim(), args);
      if (!row) return null;
      const parsed = parseJsonFields(table, row);
      const includes = (opts?.include || extractIncludesFromSelect(opts?.select as Record<string, unknown>)) as Record<string, unknown> | undefined;
      if (includes) await resolveIncludes(parsed, table, includes);
      return parsed;
    },

    async findUnique(opts: Record<string, unknown>): Promise<Row | null> {
      const { clause, args } = buildWhere(opts.where as Record<string, unknown>);
      const select = buildSelect(opts?.select as Record<string, unknown>);
      const row = await queryOne(`SELECT ${select} FROM ${q} ${clause} LIMIT 1`.trim(), args);
      if (!row) return null;
      const parsed = parseJsonFields(table, row);
      const includes = (opts?.include || extractIncludesFromSelect(opts?.select as Record<string, unknown>)) as Record<string, unknown> | undefined;
      if (includes) await resolveIncludes(parsed, table, includes);
      return parsed;
    },

    async create(opts: Record<string, unknown>): Promise<Row> {
      const data = { ...(opts.data as Record<string, unknown>) };
      const id = cuid();
      data.id = id;
      data.createdAt = new Date().toISOString();
      if ((table === "Course" || table === "SharedCourse") && data.courseData !== undefined) {
        data.courseData = typeof data.courseData === "string" ? data.courseData : JSON.stringify(data.courseData);
      }
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      const values = keys.map((k) => data[k] as InArgs);
      const placeholders = keys.map(() => "?").join(", ");
      await execute(`INSERT INTO ${q} (${keys.map(k => `"${k}"`).join(", ")}) VALUES (${placeholders})`, values);
      const created = await queryOne(`SELECT * FROM ${q} WHERE id = ?`, [id]);
      const parsed = created ? parseJsonFields(table, created) : ({ id, ...data } as Row);
      if (opts.include) await resolveIncludes(parsed, table, opts.include as Record<string, unknown>);
      return parsed;
    },

    async update(opts: Record<string, unknown>): Promise<Row> {
      const data = { ...(opts.data as Record<string, unknown>) };
      if ((table === "Course" || table === "SharedCourse") && data.courseData !== undefined) {
        data.courseData = typeof data.courseData === "string" ? data.courseData : JSON.stringify(data.courseData);
      }
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      const setClauses = keys.map((k) => `"${k}" = ?`);
      const values = keys.map((k) => data[k] as InArgs);
      const { clause, args } = buildWhere(opts.where as Record<string, unknown>);
      await execute(`UPDATE ${q} SET ${setClauses.join(", ")} ${clause}`, [...values, ...args]);
      const updated = await queryOne(`SELECT * FROM ${q} ${clause}`, args);
      return updated ? parseJsonFields(table, updated) : ({} as Row);
    },

    async delete(opts: Record<string, unknown>): Promise<Row> {
      const { clause, args } = buildWhere(opts.where as Record<string, unknown>);
      const existing = await queryOne(`SELECT * FROM ${q} ${clause}`, args);
      await execute(`DELETE FROM ${q} ${clause}`, args);
      return existing ? parseJsonFields(table, existing) : ({} as Row);
    },

    async count(opts?: Record<string, unknown>): Promise<number> {
      const { clause, args } = buildWhere(opts?.where as Record<string, unknown>);
      const result = await queryOne(`SELECT COUNT(*) as count FROM ${q} ${clause}`, args);
      return Number(result?.count || 0);
    },
  };
}

// ─── Tenant Model with _count ─────────────────────────────────────────────────

function createTenantModel() {
  const base = createModel("Tenant");
  return {
    ...base,
    async findMany(opts?: Record<string, unknown>) {
      const tenants = await base.findMany({ where: opts?.where, orderBy: opts?.orderBy });
      const inc = opts?.include as Record<string, unknown> | undefined;
      if (inc?._count) {
        const countSelect = (inc._count as Record<string, unknown>).select as Record<string, boolean> || {};
        for (const t of tenants) {
          const counts: Record<string, number> = {};
          if (countSelect.users) {
            const r = await query('SELECT COUNT(*) as count FROM "User" WHERE "tenantId" = ?', [t.id as InArgs]);
            counts.users = Number(r[0]?.count || 0);
          }
          if (countSelect.courses) {
            const r = await query('SELECT COUNT(*) as count FROM "Course" WHERE "tenantId" = ?', [t.id as InArgs]);
            counts.courses = Number(r[0]?.count || 0);
          }
          (t as Record<string, unknown>)._count = counts;
        }
      }
      return tenants;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT — pick the right client based on DATABASE_URL
// ═══════════════════════════════════════════════════════════════════════════════

function createLibsqlPrisma() {
  return {
    user: createModel("User"),
    course: createModel("Course"),
    tenant: createTenantModel(),
    sharedCourse: createModel("SharedCourse"),
    reviewer: createModel("Reviewer"),
    comment: createModel("Comment"),
    asset: createModel("Asset"),
    $disconnect: async () => {},
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = isPostgres ? createPrismaClient() : createLibsqlPrisma();
