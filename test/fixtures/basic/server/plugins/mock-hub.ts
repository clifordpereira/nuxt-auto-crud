// @ts-expect-error - #imports is available in runtime
import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin(() => {
  // @ts-expect-error - Mocking global
  globalThis.onHubReady = async (cb) => {
    await cb()
  }
})
