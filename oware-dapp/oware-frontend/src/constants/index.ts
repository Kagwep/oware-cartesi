// config.js or constants.js
const VITE_MODE = import.meta.env.VITE_MODE || 'production';

const isLocal = VITE_MODE === 'local';

export const dAppAddress = isLocal
  ? '0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e'
  : '0xA8864C4B6A215091956038Eb1c9Fd9527E78273b';

export const INSPECT_URL = isLocal
  ? 'http://localhost:8080/inspect'
  : 'https://oware-cartesi-v1-1.fly.dev/inspect';

export const QUERY_URL = isLocal
  ? 'http://localhost:8080/graphql'
  : 'https://oware-cartesi-v1-1.fly.dev/graphql';