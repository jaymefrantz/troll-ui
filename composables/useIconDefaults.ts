export function useIconDefaults(icon: any, defaultIcon: Icon) {
  let size = icon?.size ?? defaultIcon.size

  return {
    name: icon?.name ?? defaultIcon.name,
    size: size ?? "20",
  }
}