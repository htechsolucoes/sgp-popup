import { useQuery } from "@tanstack/react-query";

import { fetchContact } from "../services/api";

export const contactKey = contactId => ["contact", contactId];

export function useContact(contactId) {
  return useQuery({
    queryKey: contactKey(contactId),
    queryFn: () => fetchContact(contactId),
    enabled: Boolean(contactId),
    // não insiste em erro 4xx (contato inexistente / id inválido); tenta de novo só em erro de servidor
    retry: (failureCount, error) => error?.status >= 500 && failureCount < 2
  });
}