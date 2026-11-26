import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LandingPage } from "./pages/LandingPage";

export default async function Homepage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (prof) {
      profile = {
        id: prof.id,
        fullName: prof.full_name,
        role: prof.role as "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN" | string,
      };
    }
  }

  return (
    <LandingPage
      user={user ? { id: user.id, email: user.email } : null}
      profile={profile}
    />
  );
}
