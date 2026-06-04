import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grhApi, grhQueryKeys } from "../services/grh.api";

export function useGrhMutations(voirToutActive: boolean) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: grhQueryKeys.all });
  };

  const onSuccess = { onSuccess: invalidateAll };

  return {
    uploadDocument: useMutation({
      mutationFn: (payload: unknown) => grhApi.uploadDocument(payload, voirToutActive),
      ...onSuccess,
    }),
    deleteDocument: useMutation({
      mutationFn: (id: string) => grhApi.deleteDocument(id, voirToutActive),
      ...onSuccess,
    }),
    restoreDocument: useMutation({
      mutationFn: (id: string) => grhApi.restoreDocument(id, voirToutActive),
      ...onSuccess,
    }),
    permanentDeleteDocument: useMutation({
      mutationFn: (id: string) => grhApi.permanentDeleteDocument(id, voirToutActive),
      ...onSuccess,
    }),
    emptyTrash: useMutation({
      mutationFn: () => grhApi.emptyTrash(voirToutActive),
      ...onSuccess,
    }),
    generateCard: useMutation({
      mutationFn: (employeeId: string) => grhApi.generateCard(employeeId, voirToutActive),
      ...onSuccess,
    }),
    saveRolePermissions: useMutation({
      mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
        grhApi.saveRolePermissions(roleId, permissions, voirToutActive),
      ...onSuccess,
    }),
    addEmployee: useMutation({
      mutationFn: (payload: unknown) => grhApi.addEmployee(payload, voirToutActive),
      ...onSuccess,
    }),
    updateEmployee: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
        grhApi.updateEmployee(id, payload, voirToutActive),
      ...onSuccess,
    }),
    deleteEmployee: useMutation({
      mutationFn: (id: string) => grhApi.deleteEmployee(id, voirToutActive),
      ...onSuccess,
    }),
    createAgency: useMutation({
      mutationFn: (payload: unknown) => grhApi.createAgency(payload, voirToutActive),
      ...onSuccess,
    }),
    updateAgency: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
        grhApi.updateAgency(id, payload, voirToutActive),
      ...onSuccess,
    }),
    deleteAgency: useMutation({
      mutationFn: (id: string) => grhApi.deleteAgency(id, voirToutActive),
      ...onSuccess,
    }),
    createFolder: useMutation({
      mutationFn: (payload: unknown) => grhApi.createFolder(payload, voirToutActive),
      ...onSuccess,
    }),
    updateFolder: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
        grhApi.updateFolder(id, payload, voirToutActive),
      ...onSuccess,
    }),
    deleteFolder: useMutation({
      mutationFn: (id: string) => grhApi.deleteFolder(id, voirToutActive),
      ...onSuccess,
    }),
    saveParameter: useMutation({
      mutationFn: ({ key, value }: { key: string; value: string }) =>
        grhApi.saveParameter(key, value, voirToutActive),
      ...onSuccess,
    }),
    toggleVoirTout: useMutation({
      mutationFn: (active: boolean) => grhApi.toggleVoirTout(active),
    }),
    invalidateAll,
  };
}
