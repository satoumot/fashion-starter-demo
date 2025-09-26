import { LocalizedLink } from "@/components/LocalizedLink"

const EmptyCartMessage = () => {
  return (
    <div>
      <div className="lg:h-22 pb-12 lg:pb-0 border-b border-b-grayscale-100">
        <h1 className="md:text-2xl text-lg leading-none">カート</h1>
      </div>
      <p className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        カートに商品が入っていません。 <br />
        下のリンクから商品を追加してください。
      </p>
      <div>
        <LocalizedLink href="/store">商品を見る</LocalizedLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
