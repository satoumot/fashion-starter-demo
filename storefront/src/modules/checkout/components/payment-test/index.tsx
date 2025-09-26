import { twMerge } from "tailwind-merge"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <span
      className={twMerge(
        "bg-ui-tag-orange-bg text-ui-tag-orange-text border-ui-tag-orange-border inline-flex items-center gap-x-0.5 border box-border txt-compact-small-plus py-[5px] h-8 rounded-md px-2.5",
        className
      )}
    >
      <span className="font-semibold">注意:</span> テスト目的のみに利用してください。
    </span>
  )
}

export default PaymentTest
