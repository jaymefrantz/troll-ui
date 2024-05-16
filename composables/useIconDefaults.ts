export function useIconDefaults(icon: any, defaultIcon: Icon) {
  return {
    name: icon?.name ?? defaultIcon.name,
    size: icon?.size ?? defaultIcon.size,
  }
}