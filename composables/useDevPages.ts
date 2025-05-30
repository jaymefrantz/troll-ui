// prettier-ignore
export const useDevPages = () => {
  return useRouter().getRoutes().filter(({ path }) => path !== "/").reduce((obj, { path: link }) => ({ ...obj, [link]: getName(link) }), {})
}

// prettier-ignore
export function getName(link: string) {
  return link.split("/").at(-1).toLowerCase().split('-').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1))
  }).join(' ')
}
