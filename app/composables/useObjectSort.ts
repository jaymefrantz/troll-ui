export function useObjectSort<Type, Key1 extends keyof Type, Key2 extends typeof Type[Key1]>(
  array: Type[],
  key: Key1,
  nestedKey?: Key2,
) {
  if (nestedKey) {
    if (typeof array[0][key] === "number") {
      return array.sort((a, b): number => {
        return a[key][nestedKey] - b[key][nestedKey]
      })
    }
    return array.sort((a, b): number => {
      return a[key][nestedKey].toLowerCase() < b[key][nestedKey].toLowerCase() ? -1 : a[key][nestedKey].toLowerCase() > b[key][nestedKey].toLowerCase() ? 1 : 0
    })
  }

  if (typeof array[0][key] === "number") {
    return array.sort((a, b) => a[key] - b[key])
  }

  return array.sort((a, b): number => {
    return a[key].toLowerCase() < b[key].toLowerCase() ? -1 : a[key].toLowerCase() > b[key].toLowerCase() ? 1 : 0
  })
}