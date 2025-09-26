import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

export const OrderTotals: React.FC<{
  order: HttpTypes.StoreOrder
}> = ({ order }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    shipping_total,
    discount_total,
    gift_card_total,
  } = order

  return (
    <div className="sm:max-w-65 w-full flex-1">
      <div className="flex justify-between gap-4 mb-2">
        <div className="text-grayscale-500">
          <p>小計</p>
        </div>
        <div className="self-end">
          <p>
            {convertToLocale({
              currency_code: currency_code,
              amount: subtotal ?? 0,
            })}
          </p>
        </div>
      </div>
      {!!discount_total && (
        <div className="flex justify-between gap-4 mb-2">
          <div className="text-grayscale-500">
            <p>割引</p>
          </div>
          <div className="self-end">
            <p>
              -{" "}
              {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </p>
          </div>
        </div>
      )}
      <div className="flex justify-between gap-4 mb-2">
        <div className="text-grayscale-500">
          <p>送料</p>
        </div>
        <div className="self-end">
          <p>
            {convertToLocale({
              currency_code: currency_code,
              amount: shipping_total ?? 0,
            })}
          </p>
        </div>
      </div>
      {!!gift_card_total && (
        <div className="flex justify-between gap-4 mb-2">
          <div className="text-grayscale-500">
            <p>ギフトカード</p>
          </div>
          <div className="self-end">
            <p>
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </p>
          </div>
        </div>
      )}
      <div className="flex justify-between gap-4 text-md mb-1 mt-6">
        <div>
          <p>合計</p>
        </div>
        <div className="self-end">
          <p>
            {convertToLocale({
              currency_code: currency_code,
              amount: total ?? 0,
            })}
          </p>
        </div>
      </div>
      <p className="text-xs text-grayscale-500">
        税 {convertToLocale({ amount: tax_total ?? 0, currency_code })}{" "}
        を含む
      </p>
    </div>
  )
}
