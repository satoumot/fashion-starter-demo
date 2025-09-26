import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createProductTypesWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
  uploadFilesWorkflow,
} from '@medusajs/medusa/core-flows';
import {
  ExecArgs,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
  IStoreModuleService,
} from '@medusajs/framework/types';
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from '@medusajs/framework/utils';
import type FashionModuleService from '../modules/fashion/service';
import type { MaterialModelType } from '../modules/fashion/models/material';
import fs from "fs";
import path from "path";

async function getImageUrlContent(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image "${url}": ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer).toString('binary');
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    Modules.FULFILLMENT,
  );
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService: IStoreModuleService = container.resolve(
    Modules.STORE,
  );
  const fashionModuleService: FashionModuleService = container.resolve(
    'fashionModuleService',
  );

  const countries = ['jp'];

  logger.info('Seeding store data...');
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: 'Default Sales Channel',
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container,
    ).run({
      input: {
        salesChannelsData: [
          {
            name: 'Default Sales Channel',
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  logger.info('Seeding region data...');
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: 'Japan',
          currency_code: 'jpy',
          countries,
          payment_providers: ['pp_stripe_stripe'],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info('Finished seeding regions.');

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: 'jpy',
            is_default: true,
          },
          {
            currency_code: 'usd',
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
        default_region_id: region.id,
      },
    },
  });

  logger.info('Seeding tax regions...');
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
    })),
  });
  logger.info('Finished seeding tax regions.');

  logger.info('Seeding stock location data...');
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: 'Medusa store',
          address: {
            city: 'Minato city',
            country_code: 'JP',
            address_1: '',
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: 'manual_manual',
    },
  });

  logger.info('Seeding fulfillment data...');
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: 'Default',
            type: 'default',
          },
        ],
      },
    });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: 'Japan shipping',
    type: 'shipping',
    service_zones: [
      {
        name: 'Japan',
        geo_zones: [
          {
            country_code: 'jp',
            type: 'country',
          },
          // {
          //   country_code: 'gb',
          //   type: 'country',
          // },
          // {
          //   country_code: 'de',
          //   type: 'country',
          // },
          // {
          //   country_code: 'dk',
          //   type: 'country',
          // },
          // {
          //   country_code: 'se',
          //   type: 'country',
          // },
          // {
          //   country_code: 'fr',
          //   type: 'country',
          // },
          // {
          //   country_code: 'es',
          //   type: 'country',
          // },
          // {
          //   country_code: 'it',
          //   type: 'country',
          // },
        ],
      },
    ],
  });

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: '通常配送',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Standard',
          description: '2～3日で配送します。',
          code: 'standard',
        },
        prices: [
          {
            currency_code: 'usd',
            amount: 10,
          },
          {
            currency_code: 'jpy',
            amount: 1000,
          },
          {
            region_id: region.id,
            amount: 1000,
          },
        ],
        rules: [
          {
            attribute: 'enabled_in_store',
            value: '"true"',
            operator: 'eq',
          },
          {
            attribute: 'is_return',
            value: 'false',
            operator: 'eq',
          },
        ],
      },
      {
        name: '速達配送',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Express',
          description: '24時間以内に配送します。',
          code: 'express',
        },
        prices: [
          {
            currency_code: 'usd',
            amount: 20,
          },
          {
            currency_code: 'jpy',
            amount: 2000,
          },
          {
            region_id: region.id,
            amount: 2000,
          },
        ],
        rules: [
          {
            attribute: 'enabled_in_store',
            value: '"true"',
            operator: 'eq',
          },
          {
            attribute: 'is_return',
            value: 'false',
            operator: 'eq',
          },
        ],
      },
    ],
  });

  const pickupFulfillmentSet =
    await fulfillmentModuleService.createFulfillmentSets({
      name: 'Store pickup',
      type: 'pickup',
      service_zones: [
        {
          name: 'Store pickup',
          geo_zones: [
            {
              country_code: 'jp',
              type: 'country',
            },
            // {
            //   country_code: 'dk',
            //   type: 'country',
            // },
          ],
        },
      ],
    });

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: pickupFulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: '店舗受け取り',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: pickupFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Denmark Store Pickup',
          description: '無料の店舗受け取りです。',
          code: 'standard',
        },
        prices: [
          {
            currency_code: 'usd',
            amount: 0,
          },
          {
            currency_code: 'jpy',
            amount: 0,
          },
          {
            region_id: region.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: 'enabled_in_store',
            value: '"true"',
            operator: 'eq',
          },
          {
            attribute: 'is_return',
            value: 'false',
            operator: 'eq',
          },
        ],
      },
    ],
  });

  logger.info('Finished seeding fulfillment data.');

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info('Finished seeding stock location data.');

  logger.info('Seeding publishable API key data...');
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container,
  ).run({
    input: {
      api_keys: [
        {
          title: 'Webshop',
          type: 'publishable',
          created_by: '',
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info('Finished seeding publishable API key data.');

  logger.info('Seeding product data...');

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: '1人掛け',
          is_active: true,
        },
        {
          name: '2人掛け',
          is_active: true,
        },
        {
          name: '3人掛け',
          is_active: true,
        },
      ],
    },
  });

  const [sofasImage, armChairsImage] = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'sofas.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Sofas.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/product-types/sofas/image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'arm-chairs.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Armchair.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/product-types/arm-chairs/image.png',
            // ),
          },
        ],
      },
    })
    .then((res) => res.result);

  const { result: productTypes } = await createProductTypesWorkflow(
    container,
  ).run({
    input: {
      product_types: [
        {
          value: 'ソファ',
          metadata: {
            image: sofasImage,
          },
        },
        {
          value: 'アームチェアー',
          metadata: {
            image: armChairsImage,
          },
        },
      ],
    },
  });

  const [
    scandinavianSimplicityImage,
    scandinavianSimplicityCollectionPageImage,
    scandinavianSimplicityProductPageImage,
    scandinavianSimplicityProductPageWideImage,
    scandinavianSimplicityProductPageCtaImage,
    modernLuxeImage,
    modernLuxeCollectionPageImage,
    modernLuxeProductPageImage,
    modernLuxeProductPageWideImage,
    modernLuxeProductPageCtaImage,
    bohoChicImage,
    bohoChicCollectionPageImage,
    bohoChicProductPageImage,
    bohoChicProductPageWideImage,
    bohoChicProductPageCtaImage,
    timelessClassicsImage,
    timelessClassicsCollectionPageImage,
    timelessClassicsProductPageImage,
    timelessClassicsProductPageWideImage,
    timelessClassicsProductPageCtaImage,
  ] = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'scandinavian-simplicity.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Scandinavian.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/collections/scandinavian-simplicity/image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'scandinavian-simplicity-collection-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Scandinavian_collection.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/collections/scandinavian-simplicity/collection_page_image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'scandinavian-simplicity-product-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Scandinavian_product.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/collections/scandinavian-simplicity/product_page_image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'scandinavian-simplicity-product-page-wide-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Scandinavian_product_wide.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/collections/scandinavian-simplicity/product_page_wide_image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'scandinavian-simplicity-product-page-cta-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Scandinavian_product_cta.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/collections/scandinavian-simplicity/product_page_cta_image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'modern-luxe.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Modern.png')
            ).toString('binary'), 
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/collections/modern-luxe/image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'modern-luxe-collection-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Modern_collection.png')
            ).toString('binary'),           },
          {
            access: 'public',
            filename: 'modern-luxe-product-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Modern_product.png')
            ).toString('binary'),           },
          {
            access: 'public',
            filename: 'modern-luxe-product-page-wide-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Modern_product_wide.png')
            ).toString('binary'),           },
          {
            access: 'public',
            filename: 'modern-luxe-product-page-cta-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Modern_product_cta.png')
            ).toString('binary'),           },
          {
            access: 'public',
            filename: 'boho-chic.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Boho.png')
            ).toString('binary'),      
          },
          {
            access: 'public',
            filename: 'boho-chic-collection-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Boho-collection.png')
            ).toString('binary'),                },
          {
            access: 'public',
            filename: 'boho-chic-product-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Boho-product.png')
            ).toString('binary'),      
          },
          {
            access: 'public',
            filename: 'boho-chic-product-page-wide-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Boho-product-wide.png')
            ).toString('binary'),      
          },
          {
            access: 'public',
            filename: 'boho-chic-product-page-cta-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Boho-product-cta.png')
            ).toString('binary'),      
          },
          {
            access: 'public',
            filename: 'timeless-classics.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Timeless.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'timeless-classics-collection-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Timeless-collection.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'timeless-classics-product-page-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Timeless-product.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'timeless-classics-product-page-wide-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Timeless-product-wide.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'timeless-classics-product-page-cta-image.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'Timeless-product-cta.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  const { result: collections } = await createCollectionsWorkflow(
    container,
  ).run({
    input: {
      collections: [
        {
          title: 'スカンジナビアン・シンプル',
          handle: 'scandinavian-simplicity',
          metadata: {
            description:
              'ミニマルなデザイン、ニュートラルな色合い、そして上質な質感',
            image: scandinavianSimplicityImage,
            collection_page_image: scandinavianSimplicityCollectionPageImage,
            collection_page_heading:
              'スカンジナビアン・シンプル：エフォートレスな気品と、タイムレスな快適さ',
            collection_page_content: `ミニマルなデザイン、ニュートラルな色合い、そして上質な質感。クリーンで控えめな美しさと共に、心地よさを求める方に最適です。

このコレクションは、スカンジナビアの気品の本質を、あなたのリビングルームにもたらします。`,
            product_page_heading: 'コレクションから探す、理想のインテリア',
            product_page_image: scandinavianSimplicityProductPageImage,
            product_page_wide_image: scandinavianSimplicityProductPageWideImage,
            product_page_cta_image: scandinavianSimplicityProductPageCtaImage,
            product_page_cta_heading:
              "「ソファ名」は、洗練されたラインと柔らかくニュートラルな色合いで、スカンジナビアのミニマリズムを体現しています。",
            product_page_cta_link:
              '「スカンジナビアン・シンプル」コレクションをもっと見る',
          },
        },
        {
          title: 'モダン・ラグジュアリー',
          handle: 'modern-luxe',
          metadata: {
            description:
              '洗練された流麗なフォルム。モダンデザインと贅沢なくつろぎの融合',
            image: modernLuxeImage,
            collection_page_image: modernLuxeCollectionPageImage,
            collection_page_heading:
              'モダン・ラグジュアリー：モダンデザインと贅沢な暮らしが出会う場所',
            collection_page_content: `洗練された流麗なフォルムが特徴のソファが、モダンデザインと贅沢なくつろぎを融合させます。大胆なラインと上質な素材が、現代的な住まいのための究極のステートメントピースを生み出します。

時代を超えた美しさで、あなたの空間を格上げしましょう。`,
            product_page_heading: 'コレクションから探す、理想のインテリア',
            product_page_image: modernLuxeProductPageImage,
            product_page_wide_image: modernLuxeProductPageWideImage,
            product_page_cta_image: modernLuxeProductPageCtaImage,
            product_page_cta_heading:
              "「ソファ名」は、ミニマリズムとラグジュアリーが織りなす傑作です。",
            product_page_cta_link: '「モダン・ラグジュアリー」コレクションをもっと見る',
          },
        },
        {
          title: 'ボーホー・シック',
          handle: 'boho-chic',
          metadata: {
            description:
              '遊び心のあるテクスチャーと鮮やかなパターンが織りなす、多様なスタイルの融合',
            image: bohoChicImage,
            collection_page_image: bohoChicCollectionPageImage,
            collection_page_heading:
              'ボーホー・シック：自由な魅力にあふれた、リラックス感のある多様なスタイル',
            collection_page_content: `遊び心のあるテクスチャーと鮮やかなパターンが特徴のこのコレクションは、リラックスした多様な雰囲気を体現します。柔らかな生地と創造的なデザインが、どんな部屋にも温かみと個性を加えます。

大胆で自由な精神を持つ、快適さをここに`,
            product_page_heading: 'コレクションから探す、理想のインテリア',
            product_page_image: bohoChicProductPageImage,
            product_page_wide_image: bohoChicProductPageWideImage,
            product_page_cta_image: bohoChicProductPageCtaImage,
            product_page_cta_heading:
              "「ソファ名」は、リラックス感のある大きめのフォルムと個性的な生地の選択で、ボーホースタイルの本質を捉えています。",
            product_page_cta_link: '「ボーホー・シック」コレクションをもっと見る',
          },
        },
        {
          title: 'タイムレス・クラシック',
          handle: 'timeless-classics',
          metadata: {
            description:
              '優雅なフォルムと豊かな質感、伝統的な職人技と現代的な快適さの融合',
            image: timelessClassicsImage,
            collection_page_image: timelessClassicsCollectionPageImage,
            collection_page_heading:
              'タイムレス・クラシック：永続するスタイル、快適さと美しさのために作られました',
            collection_page_content: `永続するスタイルを愛する人々のためにデザインされたこのコレクションは、優雅なフォルムと豊かな質感が特徴です。伝統的な職人技と現代的な快適さを兼ね備えています。

時代に左右されることのない、温かく魅力的な雰囲気づくりに最適です。`,
            product_page_heading: 'コレクションから探す、理想のインテリア',
            product_page_image: timelessClassicsProductPageImage,
            product_page_wide_image: timelessClassicsProductPageWideImage,
            product_page_cta_image: timelessClassicsProductPageCtaImage,
            product_page_cta_heading:
              "「ソファ名」は、その優雅な曲線とクラシックなシルエットで、伝統的な魅力をもたらします。",
            product_page_cta_link:
              '「タイムレス・クラシック」コレクションをもっと見る',
          },
        },
      ],
    },
  });

  const materials: MaterialModelType[] =
    await fashionModuleService.createMaterials([
      {
        name: 'ベルベット',
      },
      {
        name: 'リネン',
      },
      {
        name: 'ブークレ',
      },
      {
        name: 'レザー',
      },
      {
        name: 'マイクロファイバー',
      },
    ]);

  await fashionModuleService.createColors([
    // ベルベット
    {
      name: 'ブラック',
      hex_code: '#4C4D4E',
      material_id: materials.find((m) => m.name === 'ベルベット').id,
    },
    {
      name: 'パープル',
      hex_code: '#904C94',
      material_id: materials.find((m) => m.name === 'ベルベット').id,
    },
    // リネン
    {
      name: 'グリーン',
      hex_code: '#438849',
      material_id: materials.find((m) => m.name === 'リネン').id,
    },
    {
      name: 'ライトグレー',
      hex_code: '#B1B1B1',
      material_id: materials.find((m) => m.name === 'リネン').id,
    },
    {
      name: 'イエロー',
      hex_code: '#F1BD37',
      material_id: materials.find((m) => m.name === 'リネン').id,
    },
    {
      name: 'レッド',
      hex_code: '#CD1F23',
      material_id: materials.find((m) => m.name === 'リネン').id,
    },
    {
      name: 'ブルー',
      hex_code: '#475F8A',
      material_id: materials.find((m) => m.name === 'リネン').id,
    },
    // マイクロファイバー
    {
      name: 'オレンジ',
      hex_code: '#EF7218',
      material_id: materials.find((m) => m.name === 'マイクロファイバー').id,
    },
    {
      name: 'ダークグレー',
      hex_code: '#4A4A4A',
      material_id: materials.find((m) => m.name === 'マイクロファイバー').id,
    },
    {
      name: 'ブラック',
      hex_code: '#282828',
      material_id: materials.find((m) => m.name === 'マイクロファイバー').id,
    },
    // ブークレ
    {
      name: 'ベージュ',
      hex_code: '#C8BCB3',
      material_id: materials.find((m) => m.name === 'ブークレ').id,
    },
    {
      name: 'ホワイト',
      hex_code: '#EAEAEA',
      material_id: materials.find((m) => m.name === 'ブークレ').id,
    },
    {
      name: 'ライトグレー',
      hex_code: '#C3C0BE',
      material_id: materials.find((m) => m.name === 'ブークレ').id,
    },
    // レザー
    {
      name: 'バイオレット',
      hex_code: '#B1ABBF',
      material_id: materials.find((m) => m.name === 'レザー').id,
    },
    {
      name: 'ベージュ',
      hex_code: '#A79D9B',
      material_id: materials.find((m) => m.name === 'レザー').id,
    },
  ]);

  const astridCurveImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'astrid-curve.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'astridcurve1.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/products/astrid-curve/image.png',
            // ),
          },
          {
            access: 'public',
            filename: 'astrid-curve-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'astridcurve2.png')
            ).toString('binary'),
            // content: await getImageUrlContent(
            //   'https://assets.agilo.com/fashion-starter/products/astrid-curve/image1.png',
            // ),
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'アストリッド・カーブ',
          handle: 'astrid-curve',
          description:
            'アストリッド・カーブは、流れるような曲線と心地よい質感の生地を組み合わせ、真のボーホーな雰囲気を醸し出します。リラックス感のあるデザインが、個性と快適さをプラスし、自由な魅力にあふれた個性的な生活空間に最適です。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '3人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'boho-chic').id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: astridCurveImages,
          options: [
            {
              title: 'Material',
              values: ['マイクロファイバー', 'ベルベット'],
            },
            {
              title: 'Color',
              values: ['ダークグレー', 'パープル'],
            },
          ],
          variants: [
            {
              title: 'マイクロファイバー / ダークグレー',
              sku: 'ASTRID-CURVE-MICROFIBER-DARK-GRAY',
              options: {
                Material: 'マイクロファイバー',
                Color: 'ダークグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ベルベット / パープル',
              sku: 'ASTRID-CURVE-VELVET-PURPLE',
              options: {
                Material: 'ベルベット',
                Color: 'パープル',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const belimeEstateImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'belime-estate.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'belimeestate1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'belime-estate-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'belimeestate2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'ビライム・エステート',
          handle: 'belime-estate',
          description:
            'ビライム・エステートは、ボタン留めの背もたれと豊かな風合いの生地で、クラシックで洗練された雰囲気を醸し出します。その贅沢な見た目と永続する快適さは、伝統的でエレガントなインテリアに完璧に調和します。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '2人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'timeless-classics',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: belimeEstateImages,
          options: [
            {
              title: 'Material',
              values: ['リネン', 'ブークレ'],
            },
            {
              title: 'Color',
              values: ['レッド', 'ブルー', 'ベージュ'],
            },
          ],
          variants: [
            {
              title: 'リネン / レッド',
              sku: 'BELIME-ESTATE-LINEN-RED',
              options: {
                Material: 'リネン',
                Color: 'レッド',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'リネン / ブルー',
              sku: 'BELIME-ESTATE-LINEN-BLUE',
              options: {
                Material: 'リネン',
                Color: 'ブルー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ベージュ',
              sku: 'BELIME-ESTATE-BOUCLE-BEIGE',
              options: {
                Material: 'ブークレ',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const cypressRetreatImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'cypress-retreat.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'cypressretreat1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'cypress-retreat-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'cypressretreat2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'サイプレス・リトリート',
          handle: 'cypress-retreat',
          description:
            'サイプレス・リトリートは、その優雅なラインと耐久性に優れた高品質な張り地で、伝統的なデザインへの敬意が込められています。時代を超えて愛されるこの一台は、どんな住まいにも、長く続く快適さと洗練された美しさをもたらします。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '3人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'timeless-classics',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: cypressRetreatImages,
          options: [
            {
              title: 'Material',
              values: ['レザー'],
            },
            {
              title: 'Color',
              values: ['ベージュ', 'バイオレット'],
            },
          ],
          variants: [
            {
              title: 'レザー / ベージュ',
              sku: 'CYPRESS-RETREAT-LEATHER-BEIGE',
              options: {
                Material: 'レザー',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'レザー / バイオレット',
              sku: 'CYPRESS-RETREAT-LEATHER-VIOLET',
              options: {
                Material: 'レザー',
                Color: 'バイオレット',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const everlyEstateImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'everly-estate.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'everlyestate1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'everly-estate-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'everlyestate2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'エヴァリー・エステート',
          handle: 'everly-estate',
          description:
            'エヴァリー・エステートは、流麗なラインと柔らかなベルベットの張り地で、モダンなエレガンスと贅沢な心地よさを融合させました。洗練されたインテリアに最適なこのソファは、気品と快適さを見事に調和させています。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '2人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'modern-luxe').id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: everlyEstateImages,
          options: [
            {
              title: 'Material',
              values: ['マイクロファイバー', 'ベルベット'],
            },
            {
              title: 'Color',
              values: ['オレンジ', 'ブラック'],
            },
          ],
          variants: [
            {
              title: 'マイクロファイバー / オレンジ',
              sku: 'EVERLY-ESTATE-MICROFIBER-ORANGE',
              options: {
                Material: 'マイクロファイバー',
                Color: 'オレンジ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ベルベット / ブラック',
              sku: 'EVERLY-ESTATE-VELVET-BLACK',
              options: {
                Material: 'ベルベット',
                Color: 'ブラック',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const havenhillEstateImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'havenhill-estate.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'heavenhill1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'havenhill-estate-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'heavenhill2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'ヘイヴンヒル',
          handle: 'havenhill-estate',
          description:
            'ヘイヴンヒルは、その優雅な曲線とクラシックなシルエットで、伝統的な魅力を添えます。耐久性に優れた贅沢な生地で張られたこのソファは、快適さとスタイルを兼ね備えた時代を超える逸品であり、どんな洗練された住まいにも自然に溶け込みます。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '1人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'timeless-classics',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'アームチェアー').id,
          status: ProductStatus.PUBLISHED,
          images: havenhillEstateImages,
          options: [
            {
              title: 'Material',
              values: ['リネン', 'ブークレ'],
            },
            {
              title: 'Color',
              values: ['グリーン', 'ライトグレー', 'イエロー'],
            },
          ],
          variants: [
            {
              title: 'リネン / グリーン',
              sku: 'HAVENHILL-ESTATE-LINEN-GREEN',
              options: {
                Material: 'リネン',
                Color: 'グリーン',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 10000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1200,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ライトグレー',
              sku: 'HAVENHILL-ESTATE-BOUCLE-LIGHT-GRAY',
              options: {
                Material: 'ブークレ',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 12000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1400,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const monacoFlairImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'monaco-flair.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'monaco1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'monaco-flair-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'monaco2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'モナコ・フレア',
          handle: 'monaco-flair',
          description:
            'モナコ・フレアは、洗練されたメタリックなアクセントと豊かな風合いの生地を組み合わせ、大胆でラグジュアリーな存在感を放ちます。そのミニマルなデザインと深い座面は、モダンなリビングルームで際立つ主役級の一台です。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '3人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'modern-luxe').id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: monacoFlairImages,
          options: [
            {
              title: 'Material',
              values: ['リネン', 'ブークレ'],
            },
            {
              title: 'Color',
              values: ['グリーン', 'ライトグレー', 'ベージュ'],
            },
          ],
          variants: [
            {
              title: 'リネン / グリーン',
              sku: 'MONACO-FLAIR-LINEN-GREEN',
              options: {
                Material: 'リネン',
                Color: 'グリーン',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ライトグレー',
              sku: 'MONACO-FLAIR-BOUCLE-LIGHT-GRAY',
              options: {
                Material: 'ブークレ',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ベージュ',
              sku: 'MONACO-FLAIR-BOUCLE-BEIGE',
              options: {
                Material: 'ブークレ',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const nordicBreezeImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'nordic-breeze.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'nordicbreeze1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'nordic-breeze-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'nordicbreeze2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'ノルディック・ブリーズ',
          handle: 'nordic-breeze',
          description:
            'ノルディック・ブリーズは、その無駄のないシルエットと軽やかな佇まいで、スカンジナビアのミニマリズムを洗練された形で表現しています。快適さとシンプルさのために作られたこの一台は、穏やかで心地よい生活空間を創り出すのに最適です。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '1人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'scandinavian-simplicity',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'アームチェアー').id,
          status: ProductStatus.PUBLISHED,
          images: nordicBreezeImages,
          options: [
            {
              title: 'Material',
              values: ['ブークレ', 'リネン'],
            },
            {
              title: 'Color',
              values: ['ベージュ', 'ホワイト', 'ライトグレー'],
            },
          ],
          variants: [
            {
              title: 'ブークレ / ベージュ',
              sku: 'NORDIC-BREEZE-BOUCLE-BEIGE',
              options: {
                Material: 'ブークレ',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 12000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1400,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ホワイト',
              sku: 'NORDIC-BREEZE-BOUCLE-WHITE',
              options: {
                Material: 'ブークレ',
                Color: 'ホワイト',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 12000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1400,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'リネン / ライトグレー',
              sku: 'NORDIC-BREEZE-LINEN-LIGHT-GRAY',
              options: {
                Material: 'リネン',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 18000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2000,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const nordicHavenImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'nordic-haven.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'nordichaven1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'nordic-haven-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'nordichaven2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'ノルディック・ヘヴン',
          handle: 'nordic-haven',
          description:
            'ノルディック・ヘヴンは、クリーンなラインと柔らかな質感を特徴とし、スカンジナビアデザインの本質を体現しています。その自然な色合いとミニマルなフレームは、どんな住まいにも、気取らない安らぎと快適さをもたらします。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '3人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'scandinavian-simplicity',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: nordicHavenImages,
          options: [
            {
              title: 'Material',
              values: ['リネン', 'ブークレ'],
            },
            {
              title: 'Color',
              values: ['ライトグレー', 'ホワイト', 'ベージュ'],
            },
          ],
          variants: [
            {
              title: 'リネン / ライトグレー',
              sku: 'NORDIC-HAVEN-LINEN-LIGHT-GRAY',
              options: {
                Material: 'リネン',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ホワイト',
              sku: 'NORDIC-HAVEN-BOUCLE-WHITE',
              options: {
                Material: 'ブークレ',
                Color: 'ホワイト',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ベージュ',
              sku: 'NORDIC-HAVEN-BOUCLE-BEIGE',
              options: {
                Material: 'ブークレ',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const osloDriftImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'oslo-drift.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'oslodrift1.png')
            ).toString('binary'),   
          },
          {
            access: 'public',
            filename: 'oslo-drift-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'oslodrift2.png')
            ).toString('binary'),   
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'オスロ・ドリフト',
          handle: 'oslo-drift',
          description:
            'オスロ・ドリフトは、柔らかく体をしっかりと支えるクッションと、流麗でモダンなフレームを備え、究極のリラクゼーションのためにデザインされました。その控えめなエレガンスとニュートラルな色合いは、現代的でミニマルな住まいに理想的にフィットします。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '2人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'scandinavian-simplicity',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: osloDriftImages,
          options: [
            {
              title: 'Material',
              values: ['ブークレ', 'リネン'],
            },
            {
              title: 'Color',
              values: ['ホワイト', 'ベージュ', 'ライトグレー'],
            },
          ],
          variants: [
            {
              title: 'ブークレ / ホワイト',
              sku: 'OSLO-DRIFT-BOUCLE-WHITE',
              options: {
                Material: 'ブークレ',
                Color: 'ホワイト',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ベージュ',
              sku: 'OSLO-DRIFT-BOUCLE-BEIGE',
              options: {
                Material: 'ブークレ',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'リネン / ライトグレー',
              sku: 'OSLO-DRIFT-LINEN-LIGHT-GRAY',
              options: {
                Material: 'リネン',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const osloSerenityImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'oslo-serenity.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'osloserenity1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'oslo-serenity-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'osloserenity2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'オスロ・セレニティ',
          handle: 'oslo-serenity',
          description:
            'オスロ・セレニティは、クリーンなラインと柔らかくニュートラルな色合いで、スカンジナビアのミニマリズムを体現しています。無駄を削ぎ落としたシルエットと贅沢なクッションが、シンプルさと快適さの絶妙なバランスを実現し、控えめなエレガンスを重んじる方に最適です。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '2人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'scandinavian-simplicity',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: osloSerenityImages,
          options: [
            {
              title: 'Material',
              values: ['レザー'],
            },
            {
              title: 'Color',
              values: ['バイオレット', 'ベージュ'],
            },
          ],
          variants: [
            {
              title: 'レザー / バイオレット',
              sku: 'OSLO-SERENITY-LEATHER-VIOLET',
              options: {
                Material: 'レザー',
                Color: 'バイオレット',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'レザー / ベージュ',
              sku: 'OSLO-SERENITY-LEATHER-BEIGE',
              options: {
                Material: 'レザー',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const palomaHavenImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'paloma-haven.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'paloma1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'paloma-haven-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'paloma2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'パロマ・ヘイブン',
          handle: 'paloma-haven',
          description:
            'パロマ・ヘイヴンは、モダン・ラグジュアリーを象徴する一品です。流麗なシルエット、洗練されたフレーム、そして上質な張り地が特徴で、どんな部屋にも気品のある存在感を与えます。その控えめなエレガンスと卓越した快適さは、現代的なエッジを効かせたタイムレスなスタイルを愛する方のためにデザインされました。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '1人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'modern-luxe').id,
          type_id: productTypes.find((pt) => pt.value === 'アームチェアー').id,
          status: ProductStatus.PUBLISHED,
          images: palomaHavenImages,
          options: [
            {
              title: 'Material',
              values: ['リネン', 'ブークレ'],
            },
            {
              title: 'Color',
              values: ['ライトグレー', 'グリーン', 'ベージュ'],
            },
          ],
          variants: [
            {
              title: 'リネン / ライトグレー',
              sku: 'PALOMA-HAVEN-LINEN-LIGHT-GRAY',
              options: {
                Material: 'リネン',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 9000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1100,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'リネン / グリーン',
              sku: 'PALOMA-HAVEN-LINEN-GREEN',
              options: {
                Material: 'リネン',
                Color: 'グリーン',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 9000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1100,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ベージュ',
              sku: 'PALOMA-HAVEN-BOUCLE-BEIGE',
              options: {
                Material: 'ブークレ',
                Color: 'ベージュ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 12000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1400,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const savannahGroveImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'savannah-grove.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'savannah1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'savannah-grove-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'savannah2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'サバンナ・グローブ',
          handle: 'savannah-grove',
          description:
            'サバンナ・グローブは、リラックス感のある大きめのフォルムと個性的な生地の選択で、ボーホースタイルの本質を捉えています。快適さと個性の両方を追求してデザインされたこの一台は、心地よく自由な雰囲気を生活空間に求める方に最適です。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '1人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'boho-chic').id,
          type_id: productTypes.find((pt) => pt.value === 'アームチェアー').id,
          status: ProductStatus.PUBLISHED,
          images: savannahGroveImages,
          options: [
            {
              title: 'Material',
              values: ['ブークレ', 'リネン'],
            },
            {
              title: 'Color',
              values: ['ライトグレー', 'イエロー'],
            },
          ],
          variants: [
            {
              title: 'ブークレ / ライトグレー',
              sku: 'SAVANNAH-GROVE-BOUCLE-LIGHT-GRAY',
              options: {
                Material: 'ブークレ',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 12000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1400,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'リネン / イエロー',
              sku: 'SAVANNAH-GROVE-LINEN-YELLOW',
              options: {
                Material: 'リネン',
                Color: 'イエロー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 9000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1100,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'リネン / ライトグレー',
              sku: 'SAVANNAH-GROVE-LINEN-LIGHT-GRAY',
              options: {
                Material: 'リネン',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 9000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1100,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const serenaMeadowImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'serena-meadow.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'serena1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'serena-meadow-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'serena2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'セレナ・メドウ',
          handle: 'serena-meadow',
          description:
            'セレナ・メドウは、クラシックなシルエットと現代的な快適さを組み合わせ、リラックス感がありながらも洗練された印象を与えます。その柔らかな張り地と優美な曲線が、どんなリビングルームにも時代を超えたエレガンスをもたらします。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '2人掛け').id,
          ],
          collection_id: collections.find(
            (c) => c.handle === 'timeless-classics',
          ).id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: serenaMeadowImages,
          options: [
            {
              title: 'Material',
              values: ['マイクロファイバー', 'ベルベット'],
            },
            {
              title: 'Color',
              values: ['ブラック', 'ダークグレー'],
            },
          ],
          variants: [
            {
              title: 'マイクロファイバー / ブラック',
              sku: 'SERENA-MEADOW-MICROFIBER-BLACK',
              options: {
                Material: 'マイクロファイバー',
                Color: 'ブラック',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'マイクロファイバー / ダークグレー',
              sku: 'SERENA-MEADOW-MICROFIBER-DARK-GRAY',
              options: {
                Material: 'マイクロファイバー',
                Color: 'ダークグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ベルベット / ブラック',
              sku: 'SERENA-MEADOW-VELVET-BLACK',
              options: {
                Material: 'ベルベット',
                Color: 'ブラック',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const suttonRoyaleImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'sutton-royale.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'sutton1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'sutton-royale-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'sutton2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'サットン・ロイヤル',
          handle: 'sutton-royale',
          description:
            'サットン・ロイヤルは、多様なスタイルが融合したデザインとクラシックなボヘミアンの快適さを兼ね備え、柔らかなボタン留めの生地と、ゆったりと迎え入れるようなワイドなフレームが特徴です。そのユニークなスタイルは、あらゆる空間にヴィンテージの趣を添えます。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '2人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'boho-chic').id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: suttonRoyaleImages,
          options: [
            {
              title: 'Material',
              values: ['ベルベット', 'マイクロファイバー'],
            },
            {
              title: 'Color',
              values: ['パープル', 'ダークグレー'],
            },
          ],
          variants: [
            {
              title: 'ベルベット / パープル',
              sku: 'SUTTON-ROYALE-VELVET-PURPLE',
              options: {
                Material: 'ベルベット',
                Color: 'パープル',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'マイクロファイバー / ダークグレー',
              sku: 'SUTTON-ROYALE-MICROFIBER-DARK-GRAY',
              options: {
                Material: 'マイクロファイバー',
                Color: 'ダークグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const velarLoftImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'velar-loft.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'velarloft1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'velar-loft-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'velarloft2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'ヴェラール・ロフト',
          handle: 'velar-loft',
          description:
            'ヴェラール・ロフトは、モダンなデザインと贅沢で豊かな座り心地を洗練された形で融合させています。豊かな風合いの生地と流麗なメタリックアクセントで張られたこのソファは、ラグジュアリーでありながら現代的なエッジも効かせ、洗練されたインテリアの中で際立つ主役となります。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '1人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'modern-luxe').id,
          type_id: productTypes.find((pt) => pt.value === 'アームチェアー').id,
          status: ProductStatus.PUBLISHED,
          images: velarLoftImages,
          options: [
            {
              title: 'Material',
              values: ['ベルベット', 'マイクロファイバー'],
            },
            {
              title: 'Color',
              values: ['ブラック', 'オレンジ'],
            },
          ],
          variants: [
            {
              title: 'ベルベット / ブラック',
              sku: 'VELAR-LOFT-VELVET-BLACK',
              options: {
                Material: 'ベルベット',
                Color: 'ブラック',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 13000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1500,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'マイクロファイバー / オレンジ',
              sku: 'VELAR-LOFT-MICROFIBER-ORANGE',
              options: {
                Material: 'マイクロファイバー',
                Color: 'オレンジ',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 11000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1300,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const veloraLuxeImages = await uploadFilesWorkflow(container)
    .run({
      input: {
        files: [
          {
            access: 'public',
            filename: 'velora-luxe.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'velora1.png')
            ).toString('binary'),  
          },
          {
            access: 'public',
            filename: 'velora-luxe-2.png',
            mimeType: 'image/png',
            content: fs.readFileSync(
              path.join(process.cwd(), 'images', 'velora2.png')
            ).toString('binary'),  
          },
        ],
      },
    })
    .then((res) => res.result);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'ヴェラール・リュクス',
          handle: 'velora-luxe',
          description:
            'ヴェラール・リュクスは、その大胆なパターンと贅沢な座り心地で、ボーホースタイルのデザインにラグジュアリーなタッチを加えます。大きめのフォルムと迎え入れるようなクッションは、リラックス感のあるスタイリッシュなインテリアの主役として理想的です。',
          category_ids: [
            categoryResult.find((cat) => cat.name === '3人掛け').id,
          ],
          collection_id: collections.find((c) => c.handle === 'boho-chic').id,
          type_id: productTypes.find((pt) => pt.value === 'ソファ').id,
          status: ProductStatus.PUBLISHED,
          images: veloraLuxeImages,
          options: [
            {
              title: 'Material',
              values: ['リネン', 'ブークレ'],
            },
            {
              title: 'Color',
              values: ['イエロー', 'ライトグレー'],
            },
          ],
          variants: [
            {
              title: 'リネン / イエロー',
              sku: 'VELORA-LUXE-LINEN-YELLOW',
              options: {
                Material: 'リネン',
                Color: 'イエロー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 15000,
                  currency_code: 'jpy',
                },
                {
                  amount: 1700,
                  currency_code: 'usd',
                },
              ],
            },
            {
              title: 'ブークレ / ライトグレー',
              sku: 'VELORA-LUXE-BOUCLE-LIGHT-GRAY',
              options: {
                Material: 'ブークレ',
                Color: 'ライトグレー',
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 20000,
                  currency_code: 'jpy',
                },
                {
                  amount: 2200,
                  currency_code: 'usd',
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  logger.info('Finished seeding product data.');
}
