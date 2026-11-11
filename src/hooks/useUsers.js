import { useQuery } from "@tanstack/react-query";

import { fetchUsers } from "../services/api";

export const usersKey = ["users"];

export function useUsers() {
  return useQuery({
    queryKey: usersKey,
    queryFn: fetchUsers
  });
}
