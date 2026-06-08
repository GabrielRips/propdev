export interface Contact {
  id: string;
  name: string;
  organisation: string;
  phone: string;
  email: string;
  role?: string;
}

export const contactsData: Record<string, Contact[]> = {};
