// Type declaration shim for @supabase/supabase-js under TS moduleResolution=bundler.
// The package ships .d.cts types but its exports map doesn't resolve cleanly
// under stricter TS settings. This shim lets us import from the package.
declare module "@supabase/supabase-js" {
  export interface SupabaseClientOptions {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
    };
    [key: string]: unknown;
  }

  export interface SupabaseClient {
    auth: {
      signInWithPassword: (creds: { email: string; password: string }) => Promise<{ data: unknown; error: { message: string } | null }>;
      signUp: (creds: { email: string; password: string }) => Promise<{ data: unknown; error: { message: string } | null }>;
      signOut: () => Promise<void>;
      getSession: () => Promise<{ data: { session: unknown } | null }>;
    };
    from: (table: string) => {
      select: (columns?: string) => { eq: (col: string, val: unknown) => { maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }> } };
      insert: (row: unknown) => Promise<{ data: unknown; error: { message: string } | null }>;
      update: (row: unknown) => { eq: (col: string, val: unknown) => Promise<{ data: unknown; error: { message: string } | null }> };
    };
    rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  }

  export function createClient(
    url: string,
    key: string,
    options?: SupabaseClientOptions,
  ): SupabaseClient;
}
