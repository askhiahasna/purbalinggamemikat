"use client";

import { EntityManager, type FieldDef, type FormValues } from "./entity-manager";
import { ROLE_LABEL, type AppRole } from "@/lib/auth/permissions";
import { createUserAction, updateUserAction, deleteUserAction } from "@/server/actions/user-actions";
import type { getUsersForAdmin } from "@/server/queries/users";

type UserRow = Awaited<ReturnType<typeof getUsersForAdmin>>[number];

const roleStyle: Record<AppRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 border border-purple-200",
  EDITOR: "bg-blue-100 text-blue-800 border border-blue-200",
  DESTINATION_MANAGER: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

export function UserManager({
  rows,
  destinations,
  currentUserId,
}: {
  rows: UserRow[];
  destinations: { id: string; name: string }[];
  currentUserId: string;
}) {
  const fields: FieldDef[] = [
    { name: "name", label: "Nama Lengkap", type: "text", required: true },
    { name: "email", label: "Email (untuk login)", type: "text", required: true },
    {
      name: "role",
      label: "Peran",
      type: "select",
      required: true,
      options: (Object.keys(ROLE_LABEL) as AppRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] })),
    },
    { name: "phone", label: "Telepon", type: "text" },
    { name: "password", label: "Kata Sandi", type: "password", required: true, hint: "Minimal 8 karakter. Saat menyunting, kosongkan jika tidak diubah." },
    { name: "isActive", label: "Akun aktif", type: "checkbox" },
    {
      name: "destinationIds",
      label: "Destinasi yang dikelola",
      type: "multicheck",
      options: destinations.map((d) => ({ value: d.id, label: d.name })),
      showIf: (v) => v.role === "DESTINATION_MANAGER",
    },
  ];

  const toForm = (u: UserRow): FormValues => ({
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    password: "",
    isActive: u.isActive,
    destinationIds: u.destinationIds,
  });

  return (
    <EntityManager
      badge="Keamanan & Hak Akses"
      title="Manajemen Pengguna & Peran (RBAC)"
      subtitle="Atur akun Super Admin, Editor, dan Pengelola Destinasi beserta destinasi yang ditugaskan."
      addLabel="Tambah Akun Baru"
      entityLabel="pengguna"
      searchPlaceholder="Cari nama atau email..."
      rows={rows}
      fields={fields}
      emptyForm={{ name: "", email: "", role: "EDITOR", phone: "", password: "", isActive: true, destinationIds: "" }}
      toForm={toForm}
      searchText={(u) => `${u.name} ${u.email}`}
      rowName={(u) => u.name}
      canDelete={(u) => u.id !== currentUserId}
      create={createUserAction}
      update={updateUserAction}
      remove={deleteUserAction}
      columns={[
        {
          header: "Pengguna",
          render: (u) => (
            <div>
              <p className="font-heading font-semibold text-stone-900">
                {u.name}
                {u.id === currentUserId && <span className="ml-2 text-[10px] text-stone-400">(Anda)</span>}
              </p>
              <p className="text-stone-500">{u.email}</p>
            </div>
          ),
        },
        {
          header: "Peran",
          render: (u) => (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${roleStyle[u.role]}`}>
              {ROLE_LABEL[u.role]}
            </span>
          ),
        },
        {
          header: "Destinasi",
          render: (u) =>
            u.role === "DESTINATION_MANAGER"
              ? u.destinationNames.length
                ? u.destinationNames.join(", ")
                : <span className="text-amber-600">Belum ditugaskan</span>
              : "—",
        },
        { header: "Login Terakhir", render: (u) => <span className="text-stone-500">{u.lastLogin}</span> },
        {
          header: "Status",
          render: (u) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                u.isActive ? "text-emerald-700 bg-emerald-50" : "text-stone-500 bg-stone-100"
              }`}
            >
              {u.isActive ? "Aktif" : "Nonaktif"}
            </span>
          ),
        },
      ]}
    />
  );
}
