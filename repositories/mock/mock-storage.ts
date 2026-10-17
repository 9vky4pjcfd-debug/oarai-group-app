export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function createMemoryStore(): KeyValueStore {
  const values = new Map<string, string>();
  return { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
}
