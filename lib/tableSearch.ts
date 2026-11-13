type SearchValue = string | number | null | undefined;

// Each caller chooses searchable fields without stringifying entire row objects.
export function filterTableRows<T>(
  rows: readonly T[],
  query: string,
  getValues: (row: T) => readonly SearchValue[],
): T[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...rows];

  return rows.filter((row) => {
    const text = getValues(row)
      .map((value) => (value == null ? "" : String(value)))
      .join(" ")
      .toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
