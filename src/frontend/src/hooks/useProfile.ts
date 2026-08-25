import { createActor } from "@/backend";
import type { UserProfile as BackendUserProfile } from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BackendUserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSaveProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: BackendUserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateProfilePhoto() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photoUrl: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateProfilePhoto(photoUrl);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useFindUserByIdOrUsername() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (identifier: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.findUserByIdOrUsername(identifier);
    },
  });
}
