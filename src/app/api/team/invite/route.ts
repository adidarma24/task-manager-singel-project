import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  full_name: z.string().min(1, "Nama wajib diisi"),
  role: z.enum(["admin", "manager", "member"]),
});

export async function POST(request: Request) {
  const supabase = createClient();

  // 1. Pastikan yang meminta sudah login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  // 2. Pastikan yang meminta adalah Admin
  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (requesterProfile?.role !== "admin") {
    return NextResponse.json(
      { error: "Hanya Admin yang bisa mengundang anggota baru" },
      { status: 403 }
    );
  }

  // 3. Validasi input
  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { email, full_name, role } = parsed.data;

  // Deteksi domain asal request secara otomatis — sehingga link undangan
  // otomatis mengarah ke localhost saat dites lokal, atau ke domain
  // production saat dipakai di Vercel. Tidak perlu diatur manual.
  const { origin } = new URL(request.url);
  const redirectTo = `${origin}/auth/callback?next=/set-password`;

  // 4. Kirim undangan lewat service_role key (server-only)
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
