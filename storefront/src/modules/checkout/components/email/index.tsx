"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { twJoin } from "tailwind-merge"
import { z } from "zod"

import { SubmitButton } from "@modules/common/components/submit-button"
import { Button } from "@/components/Button"
import { Form, InputField } from "@/components/Forms"
import { UiCloseButton, UiDialog, UiDialogTrigger } from "@/components/Dialog"
import { UiModal, UiModalOverlay } from "@/components/ui/Modal"
import { Icon } from "@/components/Icon"
import { LoginForm } from "@modules/auth/components/LoginForm"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCustomer } from "hooks/customer"
import { useSetEmail } from "hooks/cart"
import { StoreCart } from "@medusajs/types"

export const emailFormSchema = z.object({
  email: z.string().min(3, { message: '最低3文字です'}).email("メールアドレスを入力してください"),
})

const Email = ({
  countryCode,
  cart,
}: {
  countryCode: string
  cart: StoreCart
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const { data: customer, isPending: customerPending } = useCustomer()

  const isOpen = searchParams.get("step") === "email"

  const { mutate, isPending, data } = useSetEmail()

  const onSubmit = (values: z.infer<typeof emailFormSchema>) => {
    mutate(
      { ...values, country_code: countryCode },
      {
        onSuccess: (res) => {
          if (isOpen && res?.success) {
            router.push(pathname + "?step=delivery", { scroll: false })
          }
        },
      }
    )
  }

  return (
    <>
      <div className="flex justify-between mb-6 md:mb-8">
        <div className="flex justify-between flex-wrap gap-5 flex-1">
          <div>
            <p
              className={twJoin(
                "transition-fontWeight duration-75",
                isOpen && "font-semibold"
              )}
            >
              1. メールアドレス
            </p>
          </div>
          {isOpen && !customer && !customerPending && (
            <div className="text-grayscale-500">
              <p>
                ログインしていない方は{" "}
                <UiDialogTrigger>
                  <Button variant="link">ログイン</Button>
                  <UiModalOverlay>
                    <UiModal className="relative max-w-108">
                      <UiDialog>
                        <p className="text-md mb-10">ログイン</p>
                        <LoginForm
                          redirectUrl={`/${countryCode}/checkout?step=delivery`}
                          handleCheckout={onSubmit}
                        />
                        <UiCloseButton
                          variant="ghost"
                          className="absolute top-4 right-6 p-0"
                        >
                          <Icon name="close" className="w-6 h-6" />
                        </UiCloseButton>
                      </UiDialog>
                    </UiModal>
                  </UiModalOverlay>
                </UiDialogTrigger>
              </p>
            </div>
          )}
        </div>
        {!isOpen && (
          <Button
            variant="link"
            onPress={() => {
              router.push(pathname + "?step=email")
            }}
          >
            変更
          </Button>
        )}
      </div>
      {isOpen ? (
        <Form
          schema={emailFormSchema}
          onSubmit={onSubmit}
          formProps={{
            id: `email`,
          }}
          defaultValues={{ email: cart?.email || "" }}
        >
          {({ watch }) => {
            const formValue = watch("email")
            return (
              <>
                <InputField
                  placeholder="メールアドレス"
                  name="email"
                  inputProps={{
                    autoComplete: "email",
                    title: "Enter a valid email address.",
                  }}
                  data-testid="shipping-email-input"
                />
                <SubmitButton
                  className="mt-8"
                  isLoading={isPending}
                  isDisabled={!formValue}
                >
                  次へ
                </SubmitButton>
                <ErrorMessage error={data?.error} />
              </>
            )
          }}
        </Form>
      ) : cart?.email ? (
        <ul className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-34">
          <li className="text-grayscale-500">メールアドレス</li>
          <li className="text-grayscale-600 break-all">{cart.email}</li>
        </ul>
      ) : null}
    </>
  )
}

export default Email
