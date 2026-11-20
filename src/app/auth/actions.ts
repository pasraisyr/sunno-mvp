"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function registerUserAction(formData: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: "CONSUMER" | "MERCHANT";
  sponsorId?: string;
}) {
  const supabase = await getSupabaseServerClient();

  // 1. Daftar pengguna dalam Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Gagal mendaftar akaun." };
  }

  const newUserId = authData.user.id;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Semak jika sponsorId sah
  let validSponsorId: string | null = null;
  if (formData.sponsorId) {
    const { data: sponsorProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", formData.sponsorId)
      .maybeSingle();

    if (sponsorProfile) {
      validSponsorId = sponsorProfile.id;
    }
  }

  // 2. Simpan rekod ke dalam jadual profiles
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: newUserId,
    full_name: formData.fullName,
    phone_number: formData.phoneNumber,
    role: formData.role,
    sponsor_id: validSponsorId,
  });

  if (profileError) {
    return { error: `Gagal mencipta profil: ${profileError.message}` };
  }

  // 3. PEMETAAN AUTOMATIK 3-TIER KE DALAM 'network_trees'
  if (validSponsorId) {
    const treeRows: Array<{
      user_id: string;
      ancestor_id: string;
      tier: "L1" | "L2" | "L3";
    }> = [
      // L1: Penaja Terus
      {
        user_id: newUserId,
        ancestor_id: validSponsorId,
        tier: "L1",
      },
    ];

    // Cari jika penaja mempunyai penaja L1 (yang akan menjadi L2 bagi pengguna baru)
    const { data: sponsorTrees } = await supabaseAdmin
      .from("network_trees")
      .select("ancestor_id, tier")
      .eq("user_id", validSponsorId);

    if (sponsorTrees) {
      const sponsorL1 = sponsorTrees.find((t) => t.tier === "L1");
      const sponsorL2 = sponsorTrees.find((t) => t.tier === "L2");

      // Jika ada L1 bagi penaja -> menjadi L2 bagi ahli baru
      if (sponsorL1) {
        treeRows.push({
          user_id: newUserId,
          ancestor_id: sponsorL1.ancestor_id,
          tier: "L2",
        });
      }

      // Jika ada L2 bagi penaja -> menjadi L3 bagi ahli baru
      if (sponsorL2) {
        treeRows.push({
          user_id: newUserId,
          ancestor_id: sponsorL2.ancestor_id,
          tier: "L3",
        });
      }
    }

    // Masukkan ke dalam jadual network_trees
    await supabaseAdmin.from("network_trees").insert(treeRows);
  }

  return { success: true, role: formData.role };
}

export async function loginUserAction(formData: {
  email: string;
  password: string;
}) {
  const supabase = await getSupabaseServerClient();

  // 1. Log masuk melalui Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

  if (authError || !authData.user) {
    return { error: "Emel atau kata laluan tidak tepat." };
  }

  // 2. Semak role pengguna daripada jadual profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  return {
    success: true,
    role: (profile?.role as "CONSUMER" | "MERCHANT" | "ADMIN") || "CONSUMER",
  };
}

export async function logoutUserAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  return { success: true };
}
