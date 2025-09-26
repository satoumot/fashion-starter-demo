import { Metadata } from "next"
import Image from "next/image"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { CollectionsSection } from "@/components/CollectionsSection"

export const metadata: Metadata = {
  title: "Inspiration",
  description: "Get inspired by our latest collections",
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions.flatMap((r) =>
      r.countries
        ? r.countries
            .map((c) => c.iso_2)
            .filter(
              (value): value is string =>
                typeof value === "string" && Boolean(value)
            )
        : []
    )
  )

  const staticParams = countryCodes.map((countryCode) => ({
    countryCode,
  }))

  return staticParams
}

export default function InspirationPage() {
  return (
    <>
      <div className="max-md:pt-18">
        <Image
          src="/images/content/living-room-dark-green-three-seater-sofa.png"
          width={2880}
          height={1500}
          alt="Living room with dark green three-seater sofa"
          className="md:h-screen md:object-cover mb-8 md:mb-26"
        />
      </div>
      <div className="pb-26 md:pb-36">
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md mb-6 md:mb-16 md:text-2xl">
            アストリッド・カーブ：ミニマリズムとラグジュアリーが織りなす傑作
            </h3>
            <div className="md:text-md max-md:mb-16 max-w-135">
              <p>
              私たちのデザイン哲学は、美しさと実用性を兼ね備えた製品づくりを基本としています。
              スカンジナビアのシンプルさ、モダンなラグジュアリー、
              そして時代を超えて愛されるクラシックなデザインからインスピレーションを得ています。
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <LocalizedLink href="/products/astrid-curve">
              <Image
                src="/images/content/dark-gray-three-seater-sofa.png"
                width={768}
                height={572}
                alt="Dark gray three-seater sofa"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">アストリッド・カーブ</p>
                  <p className="text-grayscale-500 text-xs">
                    スカンジナビアン・シンプル
                  </p>
                </div>
                <div>
                  <p className="font-semibold">15000円</p>
                </div>
              </div>
            </LocalizedLink>
          </LayoutColumn>
          <LayoutColumn>
            <Image
              src="/images/content/living-room-brown-armchair-gray-corner-sofa.png"
              width={2496}
              height={1404}
              alt="Living room with brown armchair and gray corner sofa"
              className="mt-26 md:mt-36 mb-8 md:mb-26"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md mb-6 md:mb-16 md:text-2xl">
             ノルディックシリーズ：ミニマルなデザイン、ニュートラルな色合い、そして上質な質感

            </h3>
            <div className="md:text-md max-md:mb-16 max-w-135">
              <p>
              クリーンで控えめな美しさと共に、心地よさを求める方に最適です。
              このコレクションは、スカンジナビアのエレガンスの本質を、あなたのリビングにもたらします。
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <LocalizedLink
              href="/products/nordic-haven"
              className="mb-8 md:mb-16 inline-block"
            >
              <Image
                src="/images/content/gray-three-seater-sofa.png"
                width={768}
                height={572}
                alt="Gray three-seater sofa"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">ノルディック・ヘヴン</p>
                  <p className="text-grayscale-500 text-xs">
                    スカンジナビアン・シンプル
                  </p>
                </div>
                <div>
                  <p className="font-semibold">15000円</p>
                </div>
              </div>
            </LocalizedLink>
            <LocalizedLink href="/products/nordic-breeze">
              <Image
                src="/images/content/gray-arm-chair.png"
                width={768}
                height={572}
                alt="Gray arm chair"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">ノルディック・ブリーズ</p>
                  <p className="text-grayscale-500 text-xs">
                    スカンジナビアン・シンプル
                  </p>
                </div>
                <div>
                  <p className="font-semibold">12000円</p>
                </div>
              </div>
            </LocalizedLink>
          </LayoutColumn>
        </Layout>
        <Image
          src="/images/content/living-room-gray-two-seater-puffy-sofa.png"
          width={2880}
          height={1618}
          alt="Living room with gray two-seater puffy sofa"
          className="md:h-screen md:object-cover mt-26 md:mt-36 mb-8 md:mb-26"
        />
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md mb-6 md:mb-16 md:text-2xl">
            オスロ・ドリフト：遊び心のあるテクスチャーと鮮やかなパターンが、多様なスタイルと融合したデザイン
            </h3>
            <div className="md:text-md max-md:mb-16 max-w-135">
              <p>
              大胆で象徴的な一品をお探しの方も、繊細なエレガンスを求める方も。
              このコレクションは、洗練された魅力と、比類なき居心地の良さで、あなたの住まいを華やかに格上げします。
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <LocalizedLink href="/products/oslo-drift">
              <Image
                src="/images/content/white-two-seater-sofa.png"
                width={768}
                height={572}
                alt="White two-seater sofa"
                className="mb-4 md:mb-6"
              />
              <div className="flex justify-between">
                <div>
                  <p className="mb-1">オスロ・ドリフト</p>
                  <p className="text-grayscale-500 text-xs">
                    スカンジナビアン・シンプル
                  </p>
                </div>
                <div>
                  <p className="font-semibold">15000円</p>
                </div>
              </div>
            </LocalizedLink>
          </LayoutColumn>
        </Layout>
        <CollectionsSection className="mt-26 md:mt-36" />
      </div>
    </>
  )
}
