import type { TrustedContact } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Local trusted contacts store ─────────────────────────────────────────────

const CONTACTS_KEY = "payflow_trusted_contacts_v2";

export type ContactRelationship = "Family" | "Friend" | "Colleague" | "Other";
export type ContactAccessLevel = "View-only" | "Emergency" | "Full";

export interface TrustedContactExtended extends TrustedContact {
  relationship: ContactRelationship;
  accessLevel: ContactAccessLevel;
}

function genId() {
  return `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadContacts(): TrustedContactExtended[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (raw) return JSON.parse(raw) as TrustedContactExtended[];
  } catch {
    // ignore
  }
  // Seed with realistic contacts
  const seed: TrustedContactExtended[] = [
    {
      id: genId(),
      name: "Alex Chen",
      username: "alexchen",
      email: "alex@example.com",
      phone: "+1 555-0101",
      relationship: "Colleague",
      accessLevel: "Full",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
      lastTransactionAt: Date.now() - 1000 * 60 * 60 * 2,
      notes: "Work colleague — frequent lunch splits",
    },
    {
      id: genId(),
      name: "Sarah Kim",
      username: "sarah_k",
      phone: "+1 555-0102",
      relationship: "Friend",
      accessLevel: "Full",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
      lastTransactionAt: Date.now() - 1000 * 60 * 60 * 24,
      notes: "Roommate",
    },
    {
      id: genId(),
      name: "Marcus Johnson",
      username: "marcusj",
      email: "marcus@example.com",
      relationship: "Friend",
      accessLevel: "View-only",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      lastTransactionAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      notes: "College friend",
    },
    {
      id: genId(),
      name: "Mom",
      phone: "+1 555-0103",
      relationship: "Family",
      accessLevel: "Emergency",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
      notes: "Emergency contact",
    },
    {
      id: genId(),
      name: "Jordan Rivera",
      username: "jrivera",
      email: "jordan@example.com",
      relationship: "Friend",
      accessLevel: "Full",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
      lastTransactionAt: Date.now() - 1000 * 60 * 60 * 8,
      notes: "Gym buddy",
    },
  ];
  saveContacts(seed);
  return seed;
}

function saveContacts(contacts: TrustedContactExtended[]) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export function useTrustedContacts() {
  return useQuery<TrustedContactExtended[]>({
    queryKey: ["contacts"],
    queryFn: () => loadContacts(),
  });
}

export function useAddTrustedContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<TrustedContactExtended, "id" | "addedAt">,
    ) => {
      const contacts = loadContacts();
      const newContact: TrustedContactExtended = {
        ...input,
        id: genId(),
        addedAt: Date.now(),
      };
      saveContacts([...contacts, newContact]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useRemoveTrustedContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: string) => {
      const contacts = loadContacts();
      saveContacts(contacts.filter((c) => c.id !== contactId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUpdateTrustedContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updated: TrustedContactExtended) => {
      const contacts = loadContacts();
      saveContacts(contacts.map((c) => (c.id === updated.id ? updated : c)));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}
