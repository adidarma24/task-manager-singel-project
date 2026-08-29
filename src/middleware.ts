import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  // /auth/callback: belum ada session saat request masuk (baru akan dibuat
  // di dalam route handler-nya), jadi harus dilewatkan dulu.
  // /set-password: user sudah login (session dibuat oleh /auth/callback),
  // tapi belum wajib punya password final — tetap butuh session, jadi
  // TIDAK dikecualikan dari pengecekan !user, hanya dikecualikan dari
  // pengecekan "sudah login tidak boleh buka halaman ini" seperti login.
  const isPublicPath = request.nextUrl.pathname.startsWith("/auth/callback");

  // Belum login & bukan halaman publik -> redirect ke login
  if (!user && !isAuthPage && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sudah login & buka halaman login -> redirect ke dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
