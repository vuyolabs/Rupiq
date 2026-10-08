import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

function getPool(): Pool {
    if (!globalForPrisma.pool) {
        let url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error("DATABASE_URL is not set");
        }

        // Add connect_timeout and keepalives if not already present
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
            idleTimeoutMillis: 30000, // 30s idle release to refresh cold serverless connections
            max: 10,
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