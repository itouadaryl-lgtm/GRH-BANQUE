import { useQuery } from "@tanstack/react-query";
import { grhApi, grhQueryKeys } from "../services/grh.api";
import { GRH_TOKEN_KEY } from "../services/api.client";
import type { AccessRequest, Agency, Folder } from "../types";

export function useGrhQueries(voirToutActive: boolean) {
  const hasToken = !!localStorage.getItem(GRH_TOKEN_KEY);
  const enabled = hasToken;

  const me = useQuery({
    queryKey: grhQueryKeys.me(voirToutActive),
    queryFn: () => grhApi.fetchMe(voirToutActive),
    enabled,
  });

  const stats = useQuery({
    queryKey: grhQueryKeys.stats(voirToutActive),
    queryFn: () => grhApi.fetchStats(voirToutActive),
    enabled,
  });

  const documents = useQuery({
    queryKey: grhQueryKeys.documents(voirToutActive),
    queryFn: () => grhApi.fetchDocuments(voirToutActive),
    enabled,
  });

  const employees = useQuery({
    queryKey: grhQueryKeys.employees(voirToutActive),
    queryFn: () => grhApi.fetchEmployees(voirToutActive),
    enabled,
  });

  const roles = useQuery({
    queryKey: grhQueryKeys.roles(voirToutActive),
    queryFn: () => grhApi.fetchRoles(voirToutActive),
    enabled,
  });

  const parameters = useQuery({
    queryKey: grhQueryKeys.parameters(voirToutActive),
    queryFn: () => grhApi.fetchParameters(voirToutActive),
    enabled,
  });

  const activityLogs = useQuery({
    queryKey: grhQueryKeys.activityLogs(voirToutActive),
    queryFn: () => grhApi.fetchActivityLogs(voirToutActive),
    enabled,
  });

  const generatedCards = useQuery({
    queryKey: grhQueryKeys.cards(voirToutActive),
    queryFn: () => grhApi.fetchCards(voirToutActive),
    enabled,
  });

  const accessRequests = useQuery({
    queryKey: grhQueryKeys.accessRequests(voirToutActive),
    queryFn: () => grhApi.fetchAccessRequests(voirToutActive),
    enabled,
  });

  const agencies = useQuery({
    queryKey: grhQueryKeys.agencies(voirToutActive),
    queryFn: () => grhApi.fetchAgencies(voirToutActive),
    enabled,
  });

  const folders = useQuery({
    queryKey: grhQueryKeys.folders(voirToutActive),
    queryFn: () => grhApi.fetchFolders(voirToutActive),
    enabled,
  });

  const isLoading =
    hasToken &&
    (me.isLoading || documents.isLoading || employees.isLoading);

  return {
    currentUser: me.data ?? null,
    stats: stats.data ?? null,
    documents: documents.data ?? [],
    employees: employees.data ?? [],
    roles: roles.data ?? [],
    parameters: parameters.data ?? [],
    activityLogs: activityLogs.data ?? [],
    generatedCards: generatedCards.data ?? [],
    accessRequests: (accessRequests.data ?? []) as AccessRequest[],
    agencies: (agencies.data ?? []) as Agency[],
    folders: (folders.data ?? []) as Folder[],
    isLoading,
    isAuthenticated: hasToken && !!me.data,
    refetchAll: () => {
      me.refetch();
      stats.refetch();
      documents.refetch();
      employees.refetch();
      roles.refetch();
      parameters.refetch();
      activityLogs.refetch();
      generatedCards.refetch();
      accessRequests.refetch();
      agencies.refetch();
      folders.refetch();
    },
  };
}
