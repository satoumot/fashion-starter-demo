import { HttpTypes } from "@medusajs/types"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedButtonLink } from "@/components/LocalizedLink"
import { Icon } from "@/components/Icon"
import Item from "@modules/order/components/item"
import { OrderTotals } from "@modules/order/components/OrderTotals"
import { listOrders } from "@lib/data/orders"
import { getCustomer } from "@lib/data/customer"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const customer = await getCustomer()
  let matchingOrders = []

  if (customer) {
    const { orders } = await listOrders()
    matchingOrders = orders?.filter((o) => o.id === order?.id)
  }

  return (
    <Layout className="py-26 md:pt-39 md:pb-36">
      <LayoutColumn
        start={{ base: 1, lg: 3, xl: 4 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-md md:text-2xl mb-8 md:mb-16">
          ご注文ありがとうございます！
        </h1>
        <p className="mb-4">
          ご注文いただき、誠にありがとうございます。<br />
          ご注文は正常に完了し、まもなく発送の準備に入ります。
        </p>
        <p className="mb-8">
          ご注文内容の詳細は、ご登録のメールアドレスへお送りしました。<br />
          お客様のご注文番号は <strong>#{order.display_id}</strong>です。
        </p>
        <div className="flex gap-x-6 gap-y-4 max-sm:flex-col mb-16">
          {Boolean(matchingOrders.length) && (
            <LocalizedButtonLink href={`/account/my-orders/${order.id}`}>
              注文の詳細を確認
            </LocalizedButtonLink>
          )}
          <LocalizedButtonLink href="/" variant="outline">
            トップページへ戻る
          </LocalizedButtonLink>
        </div>
        <div className="flex max-sm:flex-col gap-x-4 gap-y-4 md:flex-col lg:flex-row mb-5">
          <div className="flex-1 overflow-hidden rounded-xs border border-grayscale-200 p-4">
            <div className="flex gap-4 items-center mb-8">
              <Icon name="map-pin" />
              <p className="text-grayscale-500">配送先住所</p>
            </div>
            <p>
              {[
                order.shipping_address?.last_name,
                order.shipping_address?.first_name,
              ]
                .filter(Boolean)
                .join(" ")}
              <br />
              {[
                order.shipping_address?.postal_code,
                [
                　order.shipping_address?.address_1,
                  order.shipping_address?.city,
                ]
                  .filter(Boolean)
                  .join(" "),
                order.shipping_address?.country?.display_name,
              ]
                .filter(Boolean)
                .join(", ")}
              <br />
              {order.shipping_address?.phone}
            </p>
          </div>
          <div className="flex-1 overflow-hidden rounded-xs border border-grayscale-200 p-4">
            <div className="flex gap-4 items-center mb-8">
              <Icon name="receipt" />
              <p className="text-grayscale-500">請求先住所</p>
            </div>
            <p>
              {[
                order.billing_address?.last_name,
                order.billing_address?.first_name,
              ]
                .filter(Boolean)
                .join(" ")}
              <br />
              {[
                order.billing_address?.postal_code,
                [
                　order.billing_address?.address_1,
                  order.billing_address?.city,
                ]
                  .filter(Boolean)
                  .join(" "),
                order.billing_address?.country?.display_name,
              ]
                .filter(Boolean)
                .join(", ")}
              <br />
              {order.billing_address?.phone}
            </p>
          </div>
        </div>
        <div className="rounded-xs border border-grayscale-200 p-4 mb-5">
          {order.items?.map((item) => <Item key={item.id} item={item} />)}
        </div>
        <div className="rounded-xs border border-grayscale-200 p-4 flex max-sm:flex-col gap-y-8 gap-x-10 md:flex-wrap justify-between">
          <div className="flex items-center self-baseline gap-4">
            <Icon name="credit-card" />
            <div>
              <p className="text-grayscale-500">支払い情報</p>
            </div>
          </div>
          <OrderTotals order={order} />
        </div>
      </LayoutColumn>
    </Layout>
  )
}
