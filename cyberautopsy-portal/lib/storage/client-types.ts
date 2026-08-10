/**
 * Client entity — the value object every backend produces and consumes.
 *
 * Kept in its own file so both the filesystem and Back4App implementations
 * can import it without circular deps.
 */

export type ClientContact = {
  name: string;
  email: string;
  title: string;
};

export type Client = {
  id: string;
  organization: string;
  organizationLegal: string;
  cage: string;
  duns?: string;
  systemBoundary: string;
  contractValueUSD?: number;
  primaryContact?: ClientContact;
  rpoFirm: string;
  c3paoFirm: string;
  affirmingOfficial: string;
  affirmingOfficialTitle: string;
  affirmingOfficialEmail?: string;
  createdAt: string;
  createdBy: string;
  archived: boolean;
};

/** Contract every backend must satisfy. */
export interface ClientRepo {
  list(): Promise<Client[]>;
  get(id: string): Promise<Client | null>;
  create(
    data: Omit<Client, "id" | "createdAt" | "createdBy" | "archived">,
    createdBy: string
  ): Promise<Client>;
  update(id: string, updates: Partial<Client>): Promise<Client>;
  archive(id: string, archived?: boolean): Promise<void>;
}

/** Seed client used by both backends on first initialisation. */
export const DEFAULT_CLIENT: Client = {
  id: "cli_seed_northwind",
  organization: "Northwind Defense Systems",
  organizationLegal: "Northwind Defense Systems, LLC",
  cage: "1A2B3",
  systemBoundary: "CUI Enclave — Primary",
  rpoFirm: "CyberAutopsy LLC",
  c3paoFirm: "Veritas Cyber Assessors",
  affirmingOfficial: "C. Northwind",
  affirmingOfficialTitle: "Chief Executive Officer",
  createdAt: new Date(0).toISOString(),
  createdBy: "system",
  archived: false
};
