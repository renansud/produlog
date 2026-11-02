import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ adapter: vi.fn(function Adapter() {}), client: vi.fn(function Client() {}) }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: mocks.adapter }));
vi.mock("@/generated/prisma/client", () => ({ PrismaClient: mocks.client }));
beforeEach(() => {
  vi.resetModules();
  delete (globalThis as unknown as { servlogPrisma?: unknown }).servlogPrisma;
  mocks.adapter.mockClear(); mocks.client.mockClear();
});
it("importar não inicializa conexão, e chamadas reutilizam o singleton", async () => {
  const { getPrisma } = await import("@/lib/prisma");
  expect(mocks.client).not.toHaveBeenCalled();
  const envBefore = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://local:synthetic@127.0.0.1:5432/test";
  try {
    expect(getPrisma()).toBe(getPrisma());
    expect(mocks.client).toHaveBeenCalledTimes(1);
    expect(mocks.adapter).toHaveBeenCalledWith(expect.objectContaining({ max: 5, connectionTimeoutMillis: 10000 }));
    expect(mocks.client).toHaveBeenCalledWith(expect.objectContaining({ log: [], errorFormat: "minimal" }));
  } finally { if (envBefore === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = envBefore; }
});
it("ausência de DATABASE_URL falha antes de inicializar adapter", async () => {
  const { getPrisma } = await import("@/lib/prisma");
  const envBefore = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try { expect(() => getPrisma()).toThrow("DATABASE_URL"); expect(mocks.adapter).not.toHaveBeenCalled(); }
  finally { if (envBefore !== undefined) process.env.DATABASE_URL = envBefore; }
});
