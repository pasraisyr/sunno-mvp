import dns from "node:dns";
// Paksa Node.js mengutamakan sambungan IPv4 bagi mengelakkan isu "fetch failed" pada Windows
dns.setDefaultResultOrder("ipv4first");

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Muat pembolehubah dari .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "❌ Ralat: Sila pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY ada dalam fail .env.local"
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

// Ambil argumen dari terminal: node scripts/create-admin.mjs [email] [password] [fullName] [phoneNumber]
const args = process.argv.slice(2);
const email = args[0] || "admin@sunno.asia";
const password = args[1] || "Password123!";
const fullName = args[2] || "Sunno Superadmin (HQ)";
const phoneNumber = args[3] || "0123456789";

async function run() {
  console.log(`\n========================================`);
  console.log(`👑 SUNNO.ASIA — Cipta Superadmin CLI`);
  console.log(`========================================`);
  console.log(`- Emel:        ${email}`);
  console.log(`- Nama:        ${fullName}`);
  console.log(`- Kata Laluan: ${password}`);
  console.log(`- Peranan:     ADMIN`);
  console.log(`----------------------------------------`);

  // Semak jika pengguna auth telah wujud
  const { data: listData, error: listErr } =
    await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
  if (listErr) {
    console.error("\n❌ Ralat menyemak senarai auth pengguna:", listErr.message);
    if (listErr.cause) {
      console.error("   Punca teknikal:", listErr.cause);
    }
    if (listErr.message?.includes("fetch failed")) {
      console.error("\n💡 PANDUAN PENYELESAIAN:");
      console.error("1. Projek Supabase anda mungkin sedang 'PAUSED' (terhenti automatik selepas 7 hari tidak aktif).");
      console.error("   👉 Buka https://supabase.com/dashboard/project/hnpbiprzzbytowkjydea dan klik 'Restore Project'.");
      console.error("2. Pastikan sambungan internet aktif.");
      console.error("3. Semak URL pangkalan data di fail .env.local.");
    }
    process.exit(1);
  }

  const existing = listData?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  let userId;
  if (existing) {
    userId = existing.id;
    console.log(`ℹ️ Akaun emel ${email} sudah wujud. Mengemaskini kata laluan & peranan ADMIN...`);
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }
    );
    if (updateErr) {
      console.error("❌ Ralat kemaskini auth:", updateErr.message);
      process.exit(1);
    }
  } else {
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
    if (createErr || !created?.user) {
      console.error("❌ Ralat mencipta akaun auth:", createErr?.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`✅ Akaun Auth pengguna berjaya didaftarkan (ID: ${userId})`);
  }

  // Masukkan / Kemas kini dalam jadual profiles dengan role ADMIN
  const { error: profErr } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    phone_number: phoneNumber,
    role: "ADMIN",
    sponsor_id: null,
  });

  if (profErr) {
    console.error("❌ Ralat kemaskini jadual profiles:", profErr.message);
    process.exit(1);
  }

  console.log(`\n🎉 SELESAI! Akaun Superadmin telah aktif 100%.`);
  console.log(`👉 Anda kini boleh log masuk di:`);
  console.log(`   http://localhost:3000/login`);
  console.log(`   Emel:        ${email}`);
  console.log(`   Kata Laluan: ${password}`);
  console.log(`   Panel Admin: http://localhost:3000/admin\n`);
}

run();

