import type { EventContext } from '@vtex/api'
import { LogLevel, NotFoundError, ResolverError } from '@vtex/api'

import type { Clients } from '../clients'

interface Item {
  Id: number
  Name: string
  unitPrice: number
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
    clients: { catalog: catalogClient },
  } = ctx

  const { IdSku, HasStockKeepingUnitModified } = ctx.body

  if (!HasStockKeepingUnitModified) return

  let product
  let totalWeight = 0

  try {
    // Add individual weights
    product = await catalogClient.getProduct(IdSku)

    if (product.IsKit) {
      const { KitItems } = product

      totalWeight = 0

      KitItems.forEach((element: Item) => {
        totalWeight += element.Dimension.weight
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

  if (product?.IsKit && totalWeight !== product.Dimension.weight) {
    // Update base product with the fixed weight
    try {
      await catalogClient.updateProduct(
        {
          ProductId: product.ProductId,
          Name: product.NameComplete,
          PackagedHeight: product.Dimension.height,
          PackagedLength: product.Dimension.length,
          PackagedWidth: product.Dimension.width,
          PackagedWeightKg: totalWeight,
        },
        IdSku
      )
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
