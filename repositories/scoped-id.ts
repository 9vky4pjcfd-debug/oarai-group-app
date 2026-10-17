export function buildScopedDocumentId(hotelId: string, entityId: string): string {
  return `${encodeURIComponent(hotelId)}__${encodeURIComponent(entityId)}`;
}
