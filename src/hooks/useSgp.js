import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchManutencoes,
  fetchOnu,
  fetchPppoe,
  fetchSgpCliente,
  fetchWifi,
  runAcao
} from "../services/api";

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

export function useManutencoes(filtro, enabled = true) {
  return useQuery({
    queryKey: ["sgp-manutencao", filtro],
    queryFn: () => fetchManutencoes(filtro),
    enabled,
    refetchInterval: false,
    staleTime: 60_000,
    retry: false
  });
}

export function usePppoe(login) {
  return useQuery({
    queryKey: ["sgp-pppoe", login],
    queryFn: () => fetchPppoe(login),
    enabled: Boolean(login),
    refetchInterval: false,
    staleTime: 30_000,
    retry: false
  });
}

export function useWifi(servicoId) {
  return useQuery({
    queryKey: ["sgp-wifi", servicoId],
    queryFn: () => fetchWifi(servicoId),
    enabled: Boolean(servicoId),
    refetchInterval: false,
    staleTime: 60_000,
    retry: false
  });
}

/** Ações que alteram algo no SGP (reiniciar, liberar, Wi-Fi). */
export function useAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ acao, ...dados }) => runAcao(acao, dados),
    onSuccess: (_data, { acao }) => {
      if (acao === "liberar") queryClient.invalidateQueries({ queryKey: ["sgp-cliente"] });
      if (acao === "alterar-wifi") queryClient.invalidateQueries({ queryKey: ["sgp-wifi"] });
    }
  });
}