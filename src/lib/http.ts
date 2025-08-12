// Shared HTTP helpers to keep API handling consistent
// - unwrap: returns payload from either { data } wrapper or raw response
// - normalizeId: extracts a string ID from common candidate fields

export function unwrap<T = any>(resp: any): T {
  const d = resp?.data;
  if (d && typeof d === "object" && "data" in d) return d.data as T;
  return (resp?.data ?? resp) as T;
}

export function normalizeId(
  obj: any,
  candidates: string[] = ["id", "note_id", "topic_id", "channel_id", "user_id"]
): string {
  for (const key of candidates) {
    const v = obj?.[key];
    if (v !== undefined && v !== null) return String(v);
  }
  return "";
}
