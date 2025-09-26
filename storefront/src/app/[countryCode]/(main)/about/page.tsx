import { Metadata } from "next"
import Image from "next/image"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Sofa Society",
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

export default function AboutPage() {
  return (
    <>
      <div className="max-md:pt-18">
        <Image
          src="/images/content/living-room-gray-three-seater-sofa.png"
          width={2880}
          height={1500}
          alt="Living room with gray three-seater sofa"
          className="md:h-screen md:object-cover"
        />
      </div>
      <div className="pt-8 md:pt-26 pb-26 md:pb-36">
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-md max-lg:mb-6 md:text-2xl">
              Systena <br /> ソファは、家庭の中心だ
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="md:text-md lg:mt-18">
              <p className="mb-5 lg:mb-9">
                私たちは、快適さとスタイルを見事に両立させ、
                細部まで考え抜かれたデザインの高品質なソファをお届けすることに情熱を注いでいます。
              </p>
              <p>
                私たちの使命は、永くご愛用いただける製品を通じて、
                お客様の生活空間を、心から安らげる美しい場所へと変えていくことです。
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn>
            <Image
              src="/images/content/living-room-black-armchair-dark-gray-sofa.png"
              width={2496}
              height={1404}
              alt="Living room with black armchair and dark gray sofa"
              className="mt-26 lg:mt-36 mb-8 lg:mb-26"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
            <h3 className="text-md lg:mb-10 mb-6 md:text-2xl">
              あなたの暮らしに、あなたらしいスタイルを映し出す
            </h3>
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 6 }}>
            <div className="mb-16 lg:mb-26">
              <p className="mb-5 md:mb-9">
                私たちのブランドの中心にあるのは、品質への深いこだわりです。
                ソファは単なる家具ではありません。心からくつろぎ、大切な人と集い、思い出を育む場所です。
                だからこそ私たちは、最高級の素材と生地だけを厳選し、永くご愛用いただけるソファだけをお届けしています。
              </p>
              <p>
                上質なレザーや柔らかなリネン、そして高機能なテキスタイルに至るまで、
                一つひとつの生地をその耐久性と美しさで厳選しています。
                私たちのこだわりは、一針一針のステッチや縫い目にまで及び、
                見た目の美しさはもちろん、永い年月ご愛用いただけることをお約束します。
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 2, lg: 1 }} end={{ base: 12, lg: 7 }}>
            <Image
              src="/images/content/gray-one-seater-sofa-wooden-coffee-table.png"
              width={1200}
              height={1600}
              alt="Gray one-seater sofa and wooden coffee table"
              className="mb-16 lg:mb-46"
            />
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="mb-6 lg:mb-20 xl:mb-36">
              <p>
                私たちのデザイン哲学は、美しさと実用性を兼ね備えた製品づくりを基本としています。
                スカンジナビアのシンプルさ、モダンなラグジュアリー、
                そして時代を超えて愛されるクラシックなデザインからインスピレーションを得て、
                幅広いテイストやライフスタイルに合うコレクションを厳選しています。
                洗練されたモダンなラインから、柔らかく心地よいシルエットまで。
                あらゆる空間と個性に応える、あなたにぴったりの一台が必ず見つかります。
              </p>
            </div>
            <div className="md:text-md max-lg:mb-26">
              <p>
                私たちは、優れたデザインは環境への配慮から生まれるべきだと考えています。
                そのため、責任ある素材調達と生産プロセスを通じて、環境負荷を最小限に抑える努力を続けています。
                私たちのサステナビリティへの取り組みは、製品が美しいだけでなく、地球にやさしいことの証です。
              </p>
            </div>
          </LayoutColumn>
        </Layout>
        <Image
          src="/images/content/living-room-gray-three-seater-puffy-sofa.png"
          width={2880}
          height={1618}
          alt="Living room with gray three-seater puffy sofa"
          className="mb-8 lg:mb-26"
        />
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-md max-lg:mb-6 md:text-2xl">
              常にお客様を中心に
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="md:text-md lg:mt-18">
              <p className="mb-5 lg:mb-9">
                私たちのチームが、お客様が理想の一台を見つけられるまで、
                ソファ選びのプロセスを丁寧にガイドし、一人ひとりに寄り添ったサポートを提供します。
              </p>
              <p>
                私たちは単にソファを販売しているのではありません。
                お客様が心から安らぎ、明日への活力を得て、そして永く続く思い出を育むための空間づくりをお手伝いしています。
                Systenaを、あなたの大切な住まいの一部に選んでいただき、心から感謝いたします。
              </p>
            </div>
          </LayoutColumn>
        </Layout>
      </div>
    </>
  )
}
