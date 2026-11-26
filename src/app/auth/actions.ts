"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function registerUserAction(formData: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: "USER" | "MERCHANT" | "AGEN_PROMOTER";
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

  // Semak jika sponsorId sah & periksa role penaja
  let validSponsorId: string | null = null;
  let sponsorRole: string | null = null;

  if (formData.sponsorId) {
    const { data: sponsorProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", formData.sponsorId)
      .maybeSingle();

    if (sponsorProfile) {
      validSponsorId = sponsorProfile.id;
      sponsorRole = sponsorProfile.role;
    }
  }

  // 2. Simpan rekod ke dalam jadual profiles (Role: USER, MERCHANT, AGEN_PROMOTER)
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: newUserId,
    full_name: formData.fullName,
    phone_number: formData.phoneNumber,
    role: formData.role,
    sponsor_id: validSponsorId,
    referred_by_id: validSponsorId,
    referred_by_role: sponsorRole,
  });

  if (profileError) {
    return { error: `Gagal mencipta profil: ${profileError.message}` };
  }

  // 3. PEMETAAN 2-LEVEL KE DALAM 'network_trees' (TIADA L3 & TIADA DOWNLINE ANTARA AGEN)
  // Peraturan: Agen Promoter tidak membina downline sesama agen
  const isAgentToAgent = formData.role === "AGEN_PROMOTER" && sponsorRole === "AGEN_PROMOTER";

  if (validSponsorId && !isAgentToAgent) {
    const treeRows: Array<{
      user_id: string;
      ancestor_id: string;
      tier: "L1" | "L2";
    }> = [
      // L1: Perujuk Terus
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
      // Hanya masukkan L2 (Tiada L3!)
      if (sponsorL1) {
        treeRows.push({
          user_id: newUserId,
          ancestor_id: sponsorL1.ancestor_id,
          tier: "L2",
        });
      }
    }

    // Masukkan ke dalam jadual network_trees (mengabaikan konflik jika ada)
    await supabaseAdmin.from("network_trees").upsert(treeRows, {
      onConflict: "user_id,ancestor_id",
      ignoreDuplicates: true,
    });
  }

  // 4. Jika mendaftar sebagai MERCHANT, automatik cipta rekod placeholder di jadual merchants
  if (formData.role === "MERCHANT") {
    const slug = formData.fullName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-" + newUserId.slice(0, 4);

    await supabaseAdmin.from("merchants").insert({
      user_id: newUserId,
      shop_name: `Kedai ${formData.fullName}`,
      slug,
      is_active: false,
      pioneer_payment_status: "UNPAID",
      referred_by_promoter_id: sponsorRole === "AGEN_PROMOTER" ? validSponsorId : null,
    });
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

  const userRole = (profile?.role as "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN") || "USER";

  return {
    success: true,
    role: userRole,
  };
}

export async function logoutUserAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  return { success: true };
}
