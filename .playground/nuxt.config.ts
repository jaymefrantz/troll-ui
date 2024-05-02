export default defineNuxtConfig({
  extends: ['..'],
  runtimeConfig: {
    public: {
      ...process.env,
    }
  }
})
