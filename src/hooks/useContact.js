import { useQuery } from "@tanstack/react-query";

import { fetchContact } from "../services/api";

export const contactKey = contactId => ["contact", contactId];

export function useContact(contactId) {
  return useQuery({
    queryKey: contactKey(contactId),
    queryFn: () => fetchContact(contactId),
    enabled: Boolean(contactId)
  });
}