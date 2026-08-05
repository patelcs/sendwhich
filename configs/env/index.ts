export const env = {
  isMiniApp: process.env.NEXT_PUBLIC_IS_MINIAPP === 'true',
  miniAppId: `${process.env.NEXT_PUBLIC_MINIAPP_ID}`,
  enableEruda: process.env.NEXT_PUBLIC_ENABLE_ERUDA === 'true'
}