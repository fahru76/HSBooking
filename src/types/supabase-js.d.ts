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
      signInWithPassword: (creds: { email: string; password: string }) => Promise<{ data: { session: unknown | null }; error: { message: string } | null }>;
      signUp: (creds: { email: string; password: string }) => Promise<{ data: { session: unknown | null; user: { id: string; email: string } | null }; error: { message: string } | null }>;
      signOut: () => Promise<{ error: { message: string } | null }>;
      getSession: () => Promise<{ data: { session: { user: { id: string; email: string } | null; access_token: string } | null } }>;
      getUser: (jwt?: string) => Promise<{ data: { user: { id: string; email: string } | null }; error: { message: string } | null }>;
      onAuthStateChange: (cb: (event: string, session: { user: { id: string; email: string } | null } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
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
