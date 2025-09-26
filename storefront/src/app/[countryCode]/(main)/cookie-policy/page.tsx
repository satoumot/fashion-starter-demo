import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { Layout, LayoutColumn } from "@/components/Layout"
import { listRegions } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Cookie Policy",
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

export default function CookiePolicyPage() {
  return (
    <Layout className="pt-30 pb-20 md:pt-47 md:pb-32">
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-lg md:text-2xl mb-16 md:mb-25">
          Systena クッキーポリシー
        </h1>
      </LayoutColumn>
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 10, xl: 9 }}
        className="article"
      >
        <p>
          このクッキーポリシーは、Systenaが当社のウェブサイトでクッキーおよび同様の技術をどのように使用するかを説明するものです。
          当社のウェブサイトを利用することにより、お客様はこのポリシーに記載されているクッキーの使用に同意したものとみなされます。
        </p>
        <h2>1. クッキー（Cookie）とは</h2>
        <p>
          クッキーとは、お客様がウェブサイトにアクセスした際に、お使いのコンピュータまたはデバイスに保存される小さなテキストファイルのことです。
          ウェブサイトをより効率的に機能させ、より快適なブラウジング体験を提供するために広く利用されています。
          また、クッキーにより、ウェブサイトの所有者は訪問者に関する特定の情報を収集することが可能になります。
        </p>
        <h2>2. 当社が使用するクッキーの種類</h2>
        <p>当社では、以下の種類のクッキーを使用しています：</p>
        <ul>
          <li>
            必須クッキー： これらのクッキーは、当社のウェブサイトの運営に不可欠であり、
            お客様がサイト内を移動したり、その機能を利用したりするために必要です。
            通常、プライバシー設定、ログイン、フォームへの入力などのお客様のアクションに応じて設定されます。
          </li>
          <li>
            分析・パフォーマンスクッキー： これらのクッキーは、訪問者数、閲覧ページ、トラフィックソースなどの情報を収集することにより、
            訪問者がどのように当社のウェブサイトを利用しているかを理解するために役立ちます。
            このデータは、ウェブサイトのパフォーマンスと使いやすさを向上させるために活用されます。
          </li>
          <li>
            機能性クッキー： これらのクッキーは、お客様が行った選択（言語設定など）をウェブサイトに記憶させ、より高度な機能を提供することを可能にします。
            また、お客様の閲覧履歴に基づいてパーソナライズされたコンテンツを提供するためにも使用されることがあります。
          </li>
          <li>
            広告・ターゲティングクッキー： これらのクッキーは、お客様の興味に関連性の高い広告を配信するために使用されます。
            また、広告の表示回数を制限したり、広告キャンペーンの効果を測定したりするためにも使用されることがあります。
          </li>
        </ul>
        <h2>3. サードパーティクッキー</h2>
        <p>
          当社は、分析サービスや広告配信会社など、第三者のサービス提供者が当社のウェブサイト上にクッキーを配置することを許可する場合があります。
          これらの第三者は、お客様のオンライン活動に関する情報を、時間を超えて、また複数の異なるウェブサイトにわたって収集する場合があります。
        </p>
        <h2>4. クッキーの管理</h2>
        <p>
          お客様は、お使いのブラウザの設定を通じてクッキーを管理・制御することができます。ほとんどのウェブブラウザでは、クッキーをブロックまたは削除することが可能です。
          ただし、特定のクッキーをブロックまたは削除すると、当社のウェブサイトの機能や利便性に影響を与える可能性がありますのでご注意ください。
        </p>
        <p>
          クッキーの管理方法に関する詳細については、お使いのブラウザのヘルプまたは設定セクションをご参照ください。
        </p>
        <h2>5. クッキーポリシーの更新</h2>
        <p>
          当社は、クッキーの使用方法の変更、またはその他の運用的、法的、規制上の理由により、このクッキーポリシーを随時更新することがあります。
          重要な変更があった場合は、当社のウェブサイト上での告知をもってお知らせします。
        </p>
        <h2>6. お問い合わせ</h2>
        <p>
          このクッキーポリシー、またはお客様の個人情報の取り扱いに関してご質問、ご懸念、ご要望がございましたら、下記までご連絡ください。
        </p>
        <p>
          メールアドレス: privacy@demo.com
          <br />
          住所: Skärgårdsvägen 12, 124 55 Stockholm
        </p>
      </LayoutColumn>
    </Layout>
  )
}
