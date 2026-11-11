import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUserAvailability } from "../services/api";
import { usersKey } from "./useUsers";

export function useToggleAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ user, newAvailability }) =>
      updateUserAvailability(user.userId, newAvailability),

    // update otimista: a tela muda na hora
    onMutate: async ({ user, newAvailability }) => {
      await queryClient.cancelQueries({ queryKey: usersKey });
      const previousUsers = queryClient.getQueryData(usersKey);

      queryClient.setQueryData(usersKey, (oldUsers = []) =>
        oldUsers.map(item =>
          item.id === user.id ? { ...item, available: newAvailability } : item
        )
      );

      return { previousUsers };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersKey, context.previousUsers);
      }
      queryClient.invalidateQueries({ queryKey: usersKey });
    }

    // Sem invalidate no sucesso: a wts.chat demora alguns segundos para
    // propagar a mudança, e um refetch imediato traria o valor antigo.
  });
}
