import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
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
      { error: "Hanya Admin yang bisa membuat akun baru" },
      { status: 403 }
    );
  }

  // 3. Validasi input
  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { email, password, full_name, role } = parsed.data;

  // 4. Buat user langsung (email otomatis dianggap terverifikasi,
  // tidak ada email yang dikirim — cocok untuk tim internal)
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
