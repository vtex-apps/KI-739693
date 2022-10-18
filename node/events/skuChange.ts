import type { EventContext } from '@vtex/api'

import type { Clients } from '../clients'

export async function skuChange(ctx: EventContext<Clients>) {
  const {
    clients: { catalog: catalogClient },
  } = ctx

  const product = await catalogClient.getProduct('25')

  // eslint-disable-next-line no-console
  console.log(product)
}
