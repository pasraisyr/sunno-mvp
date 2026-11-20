import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Fungsi untuk digunakan di dalam Server Components, Server Actions & API Routes
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const item of cookiesToSet) {
            cookieStore.set(item.name, item.value, item.options);
          }
        } catch {
          // Diabaikan jika dipanggil dari Server Component biasa
        }
      },
    },
  });
}