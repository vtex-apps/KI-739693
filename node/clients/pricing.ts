import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

interface UpdateBody {
  itemId: string
  listPrice: number
  costPrice: number
  markup: number | null
  basePrice: number
  fixedPrices: FixedPrice[]
}

interface FixedPrice {
  tradePolicyId: string
  value: number
  listPrice: number
  minQuantity: number
  dateRange: DateInput
}

interface DateInput {
  from: string
  to: string
}

export default class Pricing extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://api.vtex.com/${context.account}`, context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie:
          context.adminUserAuthToken ?? context.authToken ?? '',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public async getPrice(sku: string) {
    return this.http.get(`/pricing/prices/${sku}`, {
      metric: 'get-prices-by-sku-id',
    })
  }

  public async updatePrice(sku: string, data: UpdateBody) {
    return this.http.put(`/pricing/prices/${sku}`, data, {
      metric: 'get-prices-by-sku-id',
    })
  }
}
