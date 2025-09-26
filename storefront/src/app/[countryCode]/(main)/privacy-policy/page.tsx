import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how we protect your privacy",
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

export default function PrivacyPolicyPage() {
  return (
    <Layout className="pt-30 pb-20 md:pt-47 md:pb-32">
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-lg md:text-2xl mb-16 md:mb-25">
          Systena プライバシーポリシー
        </h1>
      </LayoutColumn>
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 10, xl: 9 }}
        className="article"
      >
      <p>
        Systena（以下、「当社」）は、お客様のプライバシーを尊重し、個人情報の保護に努めています。
        このプライバシーポリシーは、お客様が当社のウェブサイト、サービス、および製品をご利用になる際に、
        当社がどのようにお客様の情報を収集、使用、開示、保護するかを定めたものです。
        当社のプラットフォームを利用することにより、お客様はこのポリシーに記載された取り扱いに同意したものとみなされます。
      </p>

      <h2>1. 収集する情報</h2>
      <p>
        当社は、お客様から直接ご提供いただく以下のような個人情報を収集することがあります。
      </p>
      <ul>
        <li>
          アカウント登録時の氏名、メールアドレス、連絡先
        </li>
        <li>商品購入時の請求先および配送先住所</li>
        <li>
          取引を安全に完了させるための支払い情報（クレジットカード/デビットカードの詳細）
        </li>
        <li>お客様が当社と共有する個人の好みやファッションに関するご興味</li>
      </ul>
      <p>
        また、お客様が当社のウェブサイトにアクセスまたは利用する際に、以下の特定の情報を自動的に収集する場合があります。
      </p>
      <ul>
        <li>
          IPアドレス、ブラウザの種類、オペレーティングシステム、デバイス情報
        </li>
        <li>
          閲覧ページ、滞在時間、参照元ウェブサイトなどの利用状況データ
        </li>
      </ul>

      <h2>2. 収集した情報の利用目的</h2>
      <p>
        当社は、お客様の個人情報を、以下の目的（ただしこれらに限定されません）で利用する場合があります。
      </p>
      <ul>
        <li>アカウント、購入、注文の提供および管理</li>
        <li>
          ショッピング体験のカスタマイズと関連商品の提案
        </li>
        <li>
          最新情報、ニュースレター、マーケティング関連のお知らせの送付（これらの受信はいつでも停止できます）
        </li>
        <li>ウェブサイトとサービスを改善するためのユーザー行動の分析</li>
        <li>
          法的義務の遵守および利用規約の執行
        </li>
      </ul>

      <h2>3. クッキーおよび類似技術</h2>
      <p>
        当社は、クッキーおよび類似技術を使用して、当社のウェブサイト上のお客様の閲覧活動に関する情報を収集します。
        これらの技術は、利用パターンの分析やユーザー体験の向上に役立ちます。お客様は、お使いのブラウザ設定を通じてクッキーの設定を管理することができます。
      </p>

      <h2>4. 情報の共有と開示</h2>
      <p>
        当社は、特定の状況下で、お客様の個人情報を第三者と共有する場合があります。
      </p>
      <ul>
        <li>
          当社の事業運営およびサービス提供を支援するサービス提供者
        </li>
        <li>法律に基づき要請があった場合の司法当局または政府機関</li>
      </ul>
      <p>
        当社が、第三者に対してマーケティング目的でお客様の個人情報を販売または貸与することはありません。
      </p>

      <h2>5. データセキュリティ</h2>
      <p>
        当社は、お客様の個人情報を不正なアクセス、改ざん、または開示から保護するために、合理的な安全管理措置を講じています。
        しかしながら、インターネット経由でのデータ送信や電子的な保管方法において、100%安全なものはありません。
      </p>

      <h2>6. お客様の権利</h2>
      <p>お客様には以下の権利があります。</p>
      <ul>
        <li>
          アカウント設定でご自身の個人情報を確認・更新する権利
        </li>
        <li>マーケティング関連の通知の受信を停止する権利</li>
        <li>
          アカウントを削除する権利（ただし、適用される法令に従います）
        </li>
      </ul>

      <h2>7. 未成年者のプライバシー</h2>
      <p>
        当社のサービスは、18歳未満の個人を対象としていません。
        保護者の同意なく未成年者から個人情報を収集したことが判明した場合、当社は速やかに当該データを削除するための措置を講じます。
      </p>

      <h2>8. プライバシーポリシーの変更</h2>
      <p>
        当社は、事業慣行の変更、またはその他の運用的、法的、規制上の理由により、このプライバシーポリシーを随時更新することがあります。
        重要な変更があった場合は、メールまたはウェブサイト上での明確な告知をもってお知らせします。
      </p>

      <h2>9. お問い合わせ</h2>
      <p>
        このプライバシーポリシーまたは当社の個人情報の取り扱いに関してご質問、ご懸念、ご要望がございましたら、下記までご連絡ください。
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
