export const onHubReady = async (cb: () => void | Promise<void>) => {
  await cb()
}
