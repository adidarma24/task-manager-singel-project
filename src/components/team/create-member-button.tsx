"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Copy, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";

function generatePassword() {
  // Password acak 10 karakter, mudah dibaca (tanpa karakter ambigu 0/O, 1/l)
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export function CreateMemberButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [role, setRole] = useState<"admin" | "manager" | "member">("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  function resetAndClose() {
    setOpen(false);
    setEmail("");
    setFullName("");
    setPassword(generatePassword());
    setRole("member");
    setError(null);
    setCreated(false);
    setCopied(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/team/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Gagal membuat akun");
      return;
    }

    setCreated(true);
    router.refresh();
  }

  function handleCopy() {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        <UserPlus className="h-4 w-4" />
        Tambah Anggota
      </button>

      <Modal open={open} onClose={resetAndClose} title="Tambah Anggota Baru">
        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Akun berhasil dibuat. Bagikan kredensial berikut ke anggota tim
              (lewat WhatsApp, dll):
            </p>

            <div className="rounded-md border bg-muted p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Email:</span> {email}
              </p>
              <p>
                <span className="text-muted-foreground">Password:</span>{" "}
                {password}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Salin Email & Password
                </>
              )}
            </button>

            <button
              onClick={resetAndClose}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nama Lengkap
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="nama@perusahaan.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Password
              </label>
              <div className="flex gap-2">
                <input
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  className="shrink-0 rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                >
                  Acak
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Sudah diisi otomatis, boleh diganti manual. Anggota bisa
                mengganti password sendiri setelah login (fitur menyusul).
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="member">Anggota</option>
                <option value="manager">Manager/Lead</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && <p className="text-sm text-status-urgent">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Membuat akun..." : "Buat Akun"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
