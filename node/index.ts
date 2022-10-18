import type {
  ParamsContext,
  ServiceContext,
  RecorderState,
  ClientsConfig,
} from '@vtex/api'
import { Service } from '@vtex/api'

import { skuChange } from './events/skuChange'
import { Clients } from './clients'

const TIMEOUT_MS = 10000
const CONCURRENCY = 10

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    code: number
  }
}

const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    events: {
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 50,
      retries: 1,
      timeout: TIMEOUT_MS,
      concurrency: CONCURRENCY,
    },
  },
}

export default new Service<Clients, State, ParamsContext>({
  clients,
  events: {
    skuChange,
  },
})
