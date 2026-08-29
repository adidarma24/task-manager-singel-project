"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ListTodo, LogOut, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "clsx";
import type { UserRole } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Task", icon: ListTodo, adminOnly: false },
  { href: "/dashboard/team", label: "Kelola Tim", icon: Users, adminOnly: true },
];

export function Sidebar({
  userName,
  role,
}: {
  userName: string;
  role: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <LayoutGrid className="h-5 w-5 text-primary" />
        <span className="font-semibold">Task Manager</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-4">
        <p className="mb-2 truncate px-3 text-sm text-muted-foreground">
          {userName}
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
