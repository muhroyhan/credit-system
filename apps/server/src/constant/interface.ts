export interface Permission {
  program: string | null;
  value: string | null;
}

export interface Identity {
  id: number;
  type: "admin" | "company" | "debitor";
  slug: string;
  permissions: Permission[];
}
