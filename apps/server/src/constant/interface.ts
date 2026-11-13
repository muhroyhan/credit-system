export interface Permission {
  program: string | null;
  value: string | null;
}

export interface Identity {
  id: number;
  type: 'admin' | 'company' | 'debitor';
  slug: string;
  permissions: Permission[];
}

export interface AuthEnv {
  Variables: { identity: Identity };
}

export interface DocumentStorage {
  put(key: string, bytes: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  remove(key: string): Promise<void>;
}

export interface ZipDocument {
  id: number;
  debitorId: number | null;
  companyName: string | null;
  createdAt: Date;
  key: string | null;
}
