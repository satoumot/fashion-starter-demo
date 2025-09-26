import { Metadata } from "next"
import Image from "next/image"
import { getRegion } from "@lib/data/regions"
import { getProductTypesList } from "@lib/data/product-types"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { CollectionsSection } from "@/components/CollectionsSection"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

const ProductTypesSection: React.FC = async () => {
  const productTypes = await getProductTypesList(0, 20, [
    "id",
    "value",
    "metadata",
  ])

  if (!productTypes) {
    return null
  }

  return (
    <Layout className="mb-26 md:mb-36 max-md:gap-x-2">
      <LayoutColumn>
        <h3 className="text-md md:text-2xl mb-8 md:mb-15">ラインナップ</h3>
      </LayoutColumn>
      {productTypes.productTypes.map((productType, index) => (
        <LayoutColumn
          key={productType.id}
          start={index % 2 === 0 ? 1 : 7}
          end={index % 2 === 0 ? 7 : 13}
        >
          <LocalizedLink href={`/store?type=${productType.value}`}>
            {typeof productType.metadata?.image === "object" &&
              productType.metadata.image &&
              "url" in productType.metadata.image &&
              typeof productType.metadata.image.url === "string" && (
                <Image
                  src={productType.metadata.image.url}
                  width={1200}
                  height={900}
                  alt={productType.value}
                  className="mb-2 md:mb-8"
                />
              )}
            <p className="text-xs md:text-md">{productType.value}</p>
          </LocalizedLink>
        </LayoutColumn>
      ))}
    </Layout>
  )
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <div className="max-md:pt-18">
        <Image
          src="/images/content/living-room-gray-armchair-two-seater-sofa.png"
          width={2880}
          height={1500}
          alt="Living room with gray armchair and two-seater sofa"
          className="md:h-screen md:object-cover"
        />
      </div>
      <div className="pt-8 pb-26 md:pt-26 md:pb-36">
        <Layout className="mb-26 md:mb-36">
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md max-md:mb-6 md:text-2xl">
              比類なき心地よさとデザインで、日々の暮らしを特別な空間に
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <div className="flex items-center h-full">
              <div className="md:text-md">
                <p>最高のソファを見つけましょう</p>
                <LocalizedLink href="/store" variant="underline">
                  今すぐ探す
                </LocalizedLink>
              </div>
            </div>
          </LayoutColumn>
        </Layout>
        <ProductTypesSection />
        <CollectionsSection className="mb-22 md:mb-36" />
        <Layout>
          <LayoutColumn className="col-span-full">
            <h3 className="text-md md:text-2xl mb-8 md:mb-16">
              会社概要
            </h3>
            <Image
              src="/images/content/gray-sofa-against-concrete-wall.png"
              width={2496}
              height={1400}
              alt="Gray sofa against concrete wall"
              className="mb-8 md:mb-16 max-md:aspect-[3/2] max-md:object-cover"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, md: 7 }}>
            <h2 className="text-md md:text-2xl">
              ソファは、家庭の中心だ
            </h2>
          </LayoutColumn>
          <LayoutColumn
            start={{ base: 1, md: 8 }}
            end={13}
            className="mt-6 md:mt-19"
          >
            <div className="md:text-md">
              <p className="mb-5 md:mb-9">
                私たちは、快適さとスタイルを見事に両立させ、
                細部まで考え抜かれたデザインの高品質なソファをお届けすることに情熱を注いでいます。
              </p>
              <p className="mb-5 md:mb-3">
                私たちの使命は、永くご愛用いただける製品を通じて、
                お客様の生活空間を、心から安らげる美しい場所へと変えていくことです。
              </p>
              {/* <LocalizedLink href="/about" variant="underline">
                もっと見る
              </LocalizedLink> */}
            </div>
          </LayoutColumn>
        </Layout>
      </div>
    </>
  )
}
