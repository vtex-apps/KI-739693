import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

interface UpdateBody {
  ProductId: number
  Name: string
  PackagedHeight: number
  PackagedLength: number
  PackagedWidth: number
  PackagedWeightKg: number
}

export default class Catalog extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.myvtex.com/api`, context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie:
          context.adminUserAuthToken ?? context.authToken ?? '',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public async getProduct(sku: string) {
    return this.http.get(
      `/catalog_system/pvt/sku/stockkeepingunitbyid/${sku}`,
      {
        metric: 'get-product-by-sku-id',
      }
    )
  }

  public async updateProduct(data: UpdateBody, skuId: string) {
    return this.http.put(`/catalog/pvt/stockkeepingunit/${skuId}`, data, {
      metric: 'update-product-by-sku-id',
    })
  }
}
