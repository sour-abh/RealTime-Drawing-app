import { PrismaClient } from "../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });


declare global {
  var prisma: PrismaClient | undefined;
}

// let prisma: PrismaClient;
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter
  });
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;