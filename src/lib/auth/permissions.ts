// Matriks hak akses. Aman diimpor dari client maupun server (tanpa dependensi server).
// PENEGAKAN tetap di server (src/server/auth/dal.ts); file ini hanya sumber aturan.

export type AppRole = "SUPER_ADMIN" | "EDITOR" | "DESTINATION_MANAGER";

export const ROLE_LABEL: Record<AppRole, string> = {
  SUPER_ADMIN: "Super Admin",
  EDITOR: "Editor",
  DESTINATION_MANAGER: "Pengelola Destinasi",
};

/** Peran yang boleh mengelola konten (kuliner, event, UMKM, berita) dan moderasi ulasan. */
export const CONTENT_ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR"];
/** Peran yang boleh membuka daftar destinasi (pengelola hanya melihat miliknya). */
export const DESTINATION_ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR", "DESTINATION_MANAGER"];
/** Pengaturan situs & manajemen pengguna. */
export const ADMIN_ONLY: AppRole[] = ["SUPER_ADMIN"];
export const ALL_ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR", "DESTINATION_MANAGER"];

/** Peran yang boleh membuka tiap route admin. */
export const ROUTE_ROLES: Record<string, AppRole[]> = {
  "/admin": ALL_ROLES,
  "/admin/destinasi": DESTINATION_ROLES,
  "/admin/kuliner": CONTENT_ROLES,
  "/admin/event": CONTENT_ROLES,
  "/admin/umkm": CONTENT_ROLES,
  "/admin/berita": CONTENT_ROLES,
  "/admin/moderasi": CONTENT_ROLES,
  "/admin/layanan": CONTENT_ROLES,
  "/admin/akomodasi": CONTENT_ROLES,
  "/admin/data": CONTENT_ROLES,
  "/admin/pengaturan": ADMIN_ONLY,
  "/admin/pengguna": ADMIN_ONLY,
};

export function canAccessRoute(role: AppRole, href: string) {
  return (ROUTE_ROLES[href] ?? ADMIN_ONLY).includes(role);
}
