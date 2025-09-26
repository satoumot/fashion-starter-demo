"use client"

import * as React from "react"
import { Form, InputField } from "@/components/Forms"
import { SubmitButton } from "@modules/common/components/submit-button"
import { forgotPassword } from "@lib/data/customer"
import { LocalizedButtonLink } from "@/components/LocalizedLink"
import { z } from "zod"

const forgotPasswordFormSchema = z.object({
  email: z.string({ message: '入力してください'}).min(3, { message: '最低3文字です'}).email("メールアドレスを入力してください"),
})

export const ForgotPasswordForm: React.FC = () => {
  const [formState, formAction] = React.useActionState(forgotPassword, {
    state: "initial",
  })

  const onSubmit = (values: z.infer<typeof forgotPasswordFormSchema>) => {
    React.startTransition(() => {
      formAction(values)
    })
  }

  if (formState.state === "success") {
    return (
      <>
        <h1 className="text-xl md:text-2xl mb-8">
          新しいパスワードを設定してください
        </h1>
        <div className="mb-8">
          <p>
            まもなくご案内メールが届きますので、お手続きいただきますようお願いいたします。
          </p>
        </div>
        <LocalizedButtonLink href="/" isFullWidth>
          トップ画面へ
        </LocalizedButtonLink>
      </>
    )
  }

  return (
    <Form onSubmit={onSubmit} schema={forgotPasswordFormSchema}>
      <h1 className="text-xl md:text-2xl mb-8">パスワードをお忘れの場合</h1>
      <div className="mb-8">
        <p>
          登録したメールアドレスを入力して、パスワードリセットの案内メールを受け取ってください。
        </p>
      </div>
      <InputField
        placeholder="メールアドレス"
        name="email"
        className="flex-1 mb-8"
        type="email"
      />
      {formState.state === "error" && (
        <p className="text-red-primary text-sm">{formState.error}</p>
      )}
      <SubmitButton isFullWidth>リセット</SubmitButton>
    </Form>
  )
}
