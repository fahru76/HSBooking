import { describe, expect, it } from "vitest";

/**
 * Mock Supabase client for deterministic local tests. Mirrors the subset of
 * the @supabase/supabase-js surface the app uses today; swap for the real
 * client in integration / live-DB gates.
 */
type Row = Record<string, unknown>;

type RowResult =
  | { data: Row[] | null; error: null }
  | { data: null; error: { message: string } };

export function createMockSupabase() {
  const tables = new Map<string, Row[]>();

  const from = (table: string): MockQuery => {
    let filter: ((row: Row) => boolean) | null = null;
    let mode: "select" | "update" | "delete" | "insert" = "select";
    let patch: Row | null = null;
    let insertRows: Row[] = [];
    let orderCol: string | null = null;
    let orderAsc = true;

    const rows = (): Row[] => {
      if (!tables.has(table)) tables.set(table, []);
      return tables.get(table)!;
    };

    const matched = (): Row[] => {
      let out = rows().filter(filter ?? (() => true));
      if (orderCol) {
        const col = orderCol;
        out = [...out].sort((a, b) => {
          const av = a[col] as string | number;
          const bv = b[col] as string | number;
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return orderAsc ? cmp : -cmp;
        });
      }
      return out.map((r) => ({ ...r }));
    };

    const chain: MockQuery = {
      select: () => {
        mode = "select";
        return chain;
      },
      eq: (column: string, value: unknown) => {
        const prev = filter;
        filter = (row: Row) => (prev ? prev(row) : true) && row[column] === value;
        return chain;
      },
      order: (column: string, opts?: { ascending?: boolean }) => {
        orderCol = column;
        orderAsc = opts?.ascending ?? true;
        return chain;
      },
      update: (p: Row) => {
        mode = "update";
        patch = p;
        return chain;
      },
      delete: () => {
        mode = "delete";
        return chain;
      },
      insert: (value: Row | Row[]) => {
        mode = "insert";
        insertRows = Array.isArray(value) ? value : [value];
        return chain;
      },
      single: async () => {
        const out = matched();
        if (out.length === 0) return { data: null, error: { message: "No rows found" } };
        if (out.length > 1) return { data: null, error: { message: "Multiple rows found" } };
        return { data: out[0], error: null };
      },
      maybeSingle: async () => {
        const out = matched();
        return { data: out[0] ?? null, error: null };
      },
      then: async (
        onfulfilled?: (value: RowResult) => RowResult | PromiseLike<RowResult>,
        onrejected?: (reason: unknown) => RowResult | PromiseLike<RowResult>,
      ): Promise<RowResult> => {
        let result: RowResult;
        try {
          if (mode === "update") {
            const target = rows().filter(filter ?? (() => true));
            target.forEach((r) => Object.assign(r, patch ?? {}));
            result = { data: target.map((r) => ({ ...r })), error: null };
          } else if (mode === "delete") {
            const target = rows().filter(filter ?? (() => true));
            target.forEach((r) => {
              const arr = rows();
              const i = arr.indexOf(r);
              if (i !== -1) arr.splice(i, 1);
            });
            result = { data: target.map((r) => ({ ...r })), error: null };
          } else if (mode === "insert") {
            rows().push(...insertRows.map((r) => ({ ...r })));
            result = { data: insertRows.map((r) => ({ ...r })), error: null };
          } else {
            result = { data: matched(), error: null };
          }
          return onfulfilled ? onfulfilled(result) : result;
        } catch (e) {
          if (onrejected) return onrejected(e);
          throw e;
        }
      },
    };

    return chain;
  };

  return {
    _tables: tables,
    _reset: () => tables.clear(),
    from,
  };
}

interface MockQuery {
  select(cols?: string): MockQuery;
  eq(column: string, value: unknown): MockQuery;
  order(column: string, opts?: { ascending?: boolean }): MockQuery;
  update(patch: Row): MockQuery;
  delete(): MockQuery;
  insert(rows: Row | Row[]): MockQuery;
  single(): Promise<{ data: Row | null; error: { message: string } | null }>;
  maybeSingle(): Promise<{ data: Row | null; error: null }>;
  then(
    onfulfilled?: (value: RowResult) => RowResult | PromiseLike<RowResult>,
    onrejected?: (reason: unknown) => RowResult | PromiseLike<RowResult>,
  ): Promise<RowResult>;
}

export type { MockQuery };

export type MockSupabase = ReturnType<typeof createMockSupabase>;

describe("createMockSupabase", () => {
  const buildDb = async () => {
    const db = createMockSupabase();
    await db.from("profiles").insert([
      { id: "owner-a", owner: true },
      { id: "owner-b", owner: true },
      { id: "guest", owner: false },
    ]);
    return db;
  };

  it("inserts and reads back", async () => {
    const db = await buildDb();
    const { data } = await db.from("profiles").select("*").eq("id", "owner-a").single();
    expect(data).toEqual({ id: "owner-a", owner: true });
  });

  it("holds owner-scoped rows separately", async () => {
    const db = await buildDb();
    await db.from("bookings").insert([
      { id: "1", ownerId: "owner-a", roomId: "r1" },
      { id: "2", ownerId: "owner-b", roomId: "r1" },
    ]);
    const { data } = await db.from("bookings").select("*").eq("ownerId", "owner-a");
    expect(data).toHaveLength(1);
    expect(data![0].id).toBe("1");
  });

  it("updates with a filter", async () => {
    const db = await buildDb();
    const { error } = await db.from("profiles").update({ owner: false }).eq("id", "owner-a");
    expect(error).toBeNull();
    const { data } = await db.from("profiles").select("*").eq("id", "owner-a").single();
    expect(data!.owner).toBe(false);
  });

  it("returns copies, not internal references", async () => {
    const db = await buildDb();
    const { data } = await db.from("profiles").select("*").eq("id", "owner-a").single();
    data!.owner = false;
    const { data: again } = await db.from("profiles").select("*").eq("id", "owner-a").single();
    expect(again!.owner).toBe(true);
  });

  it("mutation via one chain is visible to a later chain", async () => {
    const db = await buildDb();
    await db.from("profiles").delete().eq("id", "owner-b");
    const { data } = await db.from("profiles").select("*");
    expect(data!.map((r) => r.id).sort()).toEqual(["guest", "owner-a"]);
  });
});
