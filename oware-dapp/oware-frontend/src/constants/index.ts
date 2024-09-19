import.meta.env.VITE_MODE = import.meta.env.VITE_MODE || 'production';

const isLocal = import.meta.env.VITE_MODE === 'local';

export const dAppAddress = isLocal
  ? '0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e'
  : '0x2f198d4a23d9572282CE570f75555b47e1003626';

export const INSPECT_URL = isLocal
  ? 'http://localhost:8080/inspect'
  : 'https://oware-cartesi-v1.fly.dev/inspect';

export const QUERY_URL = isLocal
  ? 'http://localhost:8080/graphql'
  : 'https://oware-cartesi-v1.fly.dev/graphql';