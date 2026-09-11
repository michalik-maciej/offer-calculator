export function describeSaveState({
  hasFailed,
  isDirty,
  isSaving,
}: {
  hasFailed: boolean
  isDirty: boolean
  isSaving: boolean
}): string {
  if (hasFailed) return "Nie zapisano"
  if (isSaving) return "Zapisywanie…"
  if (isDirty) return "Niezapisane zmiany"
  return "Zapisano"
}
