"use client"

import { twJoin } from "tailwind-merge"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/Button"
import PaymentButton from "@modules/checkout/components/payment-button"
import { StoreCart } from "@medusajs/types"

const Review = ({ cart }: { cart: StoreCart }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "review"

  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0
  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods &&
    cart.shipping_methods.length > 0 &&
    cart.payment_collection

  return (
    <>
      <div className="flex justify-between mb-6 md:mb-8 border-t border-grayscale-200 pt-8 mt-8">
        <div>
          <p
            className={twJoin(
              "transition-fontWeight duration-75",
              isOpen && "font-semibold"
            )}
          >
            5. 確認
          </p>
        </div>
        {!isOpen &&
          previousStepsCompleted &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Button
              variant="link"
              onPress={() => {
                router.push(pathname + "?step=review", { scroll: false })
              }}
            >
              確認
            </Button>
          )}
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <p className="mb-8">
            「注文する」ボタンをクリックすることにより、お客様は当社の利用規約、販売条件、返品ポリシーを読み、
            理解し、同意したものとみなし、Systenaのプライバシーポリシーを読んだことを承認したものとします。
          </p>
          <PaymentButton
            cart={cart}
            selectPaymentMethod={() => {
              router.push(pathname + "?step=payment", { scroll: false })
            }}
          />
        </>
      )}
    </>
  )
}

export default Review
