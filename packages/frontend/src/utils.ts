export function getQuery(replace: Record<string, string | number | boolean | null>) {
  const queries = new URLSearchParams(location.search);
  for (const parameter in replace) {
    if (replace[parameter] == null) {
      queries.delete(parameter);
    } else {
      queries.set(parameter, (replace[parameter] as string | number | boolean).toString());
    }
  }
  return `?${queries.toString()}`;
}
