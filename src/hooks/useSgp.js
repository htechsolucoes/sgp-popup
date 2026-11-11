import { useQuery } from "@tanstack/react-query";

import { fetchOnu, fetchSgpCliente } from "../services/api";

export function useSgpCliente(cpfCnpj) {
  return useQuery({
    queryKey: ["sgp-cliente", cpfCnpj],
    queryFn: () => fetchSgpCliente(cpfCnpj),
    enabled: Boolean(cpfCnpj),
    refetchInterval: false,
    retry: (failureCount, error) => error?.status >= 500 && failureCount < 1
  });
}

export function useOnu(contratoId) {
  return useQuery({
    queryKey: ["sgp-onu", contratoId],
    queryFn: () => fetchOnu(contratoId),
    enabled: Boolean(contratoId),
    refetchInterval: false, // consultar a OLT é pesado; atualiza só pelo botão
    staleTime: 60_000,
    retry: false
  });
}