import type { EventContext } from '@vtex/api'
import { LogLevel, NotFoundError, ResolverError } from '@vtex/api'

import type { Clients } from '../clients'

interface Item {
  Id: number
  Name: string
  UnitPrice: number
  Amount: number
  EstimatedDateArrival: string
  Dimension: Dimension
  RefId: string
  EAN: string
  IsKitOptimized: boolean
}

interface Dimension {
  cubicweight: number
  height: number
  length: number
  weight: number
  width: number
}

export async function skuChange(ctx: EventContext<Clients>) {
  const {
    clients: { catalog: catalogClient, pricing: pricingClient },
  } = ctx

  const { IdSku, HasStockKeepingUnitModified } = ctx.body

  if (!HasStockKeepingUnitModified) return

  let product
  let totalPrice = 0

  try {
    // Add individual prices
    product = await catalogClient.getProduct(IdSku)

    if (product.IsKit) {
      const { KitItems } = product

      totalPrice = 0

      KitItems.forEach((element: Item) => {
        totalPrice += element.UnitPrice * element.Amount
      })
    }
  } catch (error) {
    const erroMessage = `SKU ${IdSku} not found.`
    const splunkError = {
      error: erroMessage,
      detail: error,
    }

    ctx.vtex.logger.log(splunkError, LogLevel.Error)
    throw new NotFoundError(erroMessage)
  }

  if (product?.IsKit) {
    try {
      // Get price
      const price = await pricingClient.getPrice(IdSku)

      // Update price with new calculated price
      await pricingClient.updatePrice(IdSku, {
        ...price,
        listPrice: totalPrice,
        costPrice: totalPrice,
        basePrice: totalPrice,
        fixedPrices: [
          {
            ...price.fixedPrices[0],
            value: totalPrice,
            listPrice: totalPrice,
          },
        ],
      })
    } catch (error) {
      const erroMessage = `SKU ${IdSku} cannot be updated.`
      const splunkError = {
        error: erroMessage,
        detail: error,
      }

      ctx.vtex.logger.log(splunkError, LogLevel.Error)
      throw new ResolverError(erroMessage)
    }
  }
}
