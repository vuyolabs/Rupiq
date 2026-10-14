import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

// Supabase's session-mode pooler (port 5432) pins one server connection per client and caps
// them at pool_size, so a few serverless instances each holding several connections exhaust it
// (EMAXCONNSESSION). Transaction mode (port 6543) only borrows a server connection per query.
function toTransactionPooler(url: string): string {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.endsWith(".pooler.supabase.com") && parsed.port === "5432") {
            parsed.port = "6543";
            return parsed.toString();
        }
    } catch {
        // Not a parseable URL; let pg report it
    }
    return url;
}

function getPool(): Pool {
    if (!globalForPrisma.pool) {
        let url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error("DATABASE_URL is not set");
        }

        url = toTransactionPooler(url);

        // Add connect_timeout if not already present
        if (!url.includes("connect_timeout")) {
            const separator = url.includes("?") ? "&" : "?";
            url = `${url}${separator}connect_timeout=15`;
        }

        const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
        const sslConfig = isLocal || url.includes("sslmode=disable")
            ? undefined
            : { rejectUnauthorized: false };

        globalForPrisma.pool = new Pool({
            connectionString: url,
            ssl: sslConfig,
            connectionTimeoutMillis: 15000,
            // Release idle connections quickly so frozen serverless instances don't hoard them
            idleTimeoutMillis: 10000,
            // Each serverless instance gets its own pool; keep it small so many instances fit
            max: Number(process.env.DATABASE_POOL_MAX) || (process.env.NODE_ENV === "production" ? 3 : 5),
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
        });

        globalForPrisma.pool.on("error", (err) => {
            console.error("Unexpected pg pool error (reconnecting):", err.message);
        });
    }

    return globalForPrisma.pool;
}

function createPrismaClient(): PrismaClient {
    const pool = getPool();
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
        adapter,
        transactionOptions: {
            maxWait: 15000,
            timeout: 20000,
        },
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
