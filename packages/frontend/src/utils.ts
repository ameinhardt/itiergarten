type ReplaceTypes = string | number | boolean | null;

export function getQuery(replace: Record<string, ReplaceTypes | Array<ReplaceTypes>>) {
  const queries = new URLSearchParams(location.search);
  for (const parameter in replace) {
    const values = (Array.isArray(replace[parameter]) ? replace[parameter] : [replace[parameter]]) as Array<ReplaceTypes>;
    for (const value of values) {
      if (value == null) {
        queries.delete(parameter);
      } else {
        queries.set(parameter, value.toString());
      }
    }
  }
  return `?${queries.toString()}`;
}
