import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "Mosaic Beats";

const APP_STORE_APP_NAME = "Mosaic Beats iOS";
const APP_STORE_BUNDLE_ID = "com.mosaicbeats.app";
const PLAY_STORE_APP_NAME = "Mosaic Beats Android";
const PLAY_STORE_PACKAGE_NAME = "com.mosaicbeats.app";

const ENTITLEMENT_IDENTIFIER = "pro";
const ENTITLEMENT_DISPLAY_NAME = "Pro Access";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

const PRODUCTS = [
  {
    key: "monthly",
    identifier: "pro_monthly",
    playStoreIdentifier: "pro_monthly:monthly",
    displayName: "Pro Monthly",
    userFacingTitle: "Pro Monthly",
    duration: "P1M" as const,
    packageIdentifier: "$rc_monthly",
    packageDisplayName: "Monthly",
    prices: [
      { amount_micros: 9990000, currency: "USD" },
      { amount_micros: 9990000, currency: "NOK" },
    ],
  },
  {
    key: "annual",
    identifier: "pro_annual",
    playStoreIdentifier: "pro_annual:annual",
    displayName: "Pro Annual",
    userFacingTitle: "Pro Annual",
    duration: "P1Y" as const,
    packageIdentifier: "$rc_annual",
    packageDisplayName: "Annual",
    prices: [
      { amount_micros: 79990000, currency: "USD" },
      { amount_micros: 79990000, currency: "NOK" },
    ],
  },
  {
    key: "wedding",
    identifier: "wedding_pack",
    playStoreIdentifier: "wedding_pack:lifetime",
    displayName: "Wedding Pack",
    userFacingTitle: "Wedding Pack",
    duration: "P1Y" as const,
    packageIdentifier: "$rc_lifetime",
    packageDisplayName: "Wedding Pack",
    prices: [
      { amount_micros: 14990000, currency: "USD" },
      { amount_micros: 14990000, currency: "NOK" },
    ],
  },
];

async function ensureProductForApp(
  client: Awaited<ReturnType<typeof getUncachableRevenueCatClient>>,
  project: Project,
  targetApp: App,
  label: string,
  productIdentifier: string,
  productInfo: (typeof PRODUCTS)[0],
  isTestStore: boolean
): Promise<Product> {
  const { data: existingProducts } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });

  const existingProduct = existingProducts?.items?.find(
    (p) => p.store_identifier === productIdentifier && p.app_id === targetApp.id
  );

  if (existingProduct) {
    console.log(`${label} product already exists:`, existingProduct.id);
    return existingProduct;
  }

  const body: CreateProductData["body"] = {
    store_identifier: productIdentifier,
    app_id: targetApp.id,
    type: "subscription",
    display_name: productInfo.displayName,
  };

  if (isTestStore) {
    body.subscription = { duration: productInfo.duration };
    body.title = productInfo.userFacingTitle;
  }

  const { data: createdProduct, error } = await createProduct({
    client,
    path: { project_id: project.id },
    body,
  });

  if (error) throw new Error(`Failed to create ${label} product: ${JSON.stringify(error)}`);
  console.log(`Created ${label} product:`, createdProduct.id);
  return createdProduct;
}

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  // ── Project ──
  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });
  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({ client, body: { name: PROJECT_NAME } });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  // ── Apps ──
  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsError || !apps || apps.items.length === 0) throw new Error("No apps found");

  let testApp: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!testApp) throw new Error("No test store app found");
  console.log("Test store app:", testApp.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: APP_STORE_APP_NAME, type: "app_store", app_store: { bundle_id: APP_STORE_BUNDLE_ID } },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: PLAY_STORE_APP_NAME, type: "play_store", play_store: { package_name: PLAY_STORE_PACKAGE_NAME } },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app:", playStoreApp.id);
  }

  // ── Products & Prices ──
  const productIds: { testStore: string; appStore: string; playStore: string }[] = [];

  for (const prod of PRODUCTS) {
    const testStoreProduct = await ensureProductForApp(client, project, testApp, `Test/${prod.key}`, prod.identifier, prod, true);
    const appStoreProduct = await ensureProductForApp(client, project, appStoreApp, `AppStore/${prod.key}`, prod.identifier, prod, false);
    const playStoreProduct = await ensureProductForApp(client, project, playStoreApp, `PlayStore/${prod.key}`, prod.playStoreIdentifier, prod, false);

    const { data: _priceData, error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testStoreProduct.id },
      body: { prices: prod.prices },
    });
    if (priceError) {
      if (typeof priceError === "object" && "type" in priceError && priceError["type"] === "resource_already_exists") {
        console.log(`Test store prices already exist for ${prod.key}`);
      } else {
        console.warn(`Price warning for ${prod.key}:`, JSON.stringify(priceError));
      }
    } else {
      console.log(`Prices added for ${prod.key}`);
    }

    productIds.push({ testStore: testStoreProduct.id, appStore: appStoreProduct.id, playStore: playStoreProduct.id });
  }

  // ── Entitlement ──
  let entitlement: Entitlement | undefined;
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntitlementsError) throw new Error("Failed to list entitlements");

  const existingEntitlement = existingEntitlements.items?.find((e) => e.lookup_key === ENTITLEMENT_IDENTIFIER);
  if (existingEntitlement) {
    console.log("Entitlement already exists:", existingEntitlement.id);
    entitlement = existingEntitlement;
  } else {
    const { data: newEntitlement, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: { lookup_key: ENTITLEMENT_IDENTIFIER, display_name: ENTITLEMENT_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create entitlement");
    console.log("Created entitlement:", newEntitlement.id);
    entitlement = newEntitlement;
  }

  const allProductIds = productIds.flatMap((p) => [p.testStore, p.appStore, p.playStore]);
  const { error: attachEntitlementError } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: entitlement.id },
    body: { product_ids: allProductIds },
  });
  if (attachEntitlementError) {
    if (attachEntitlementError.type === "unprocessable_entity_error") {
      console.log("Products already attached to entitlement");
    } else {
      throw new Error("Failed to attach products to entitlement");
    }
  } else {
    console.log("Attached all products to pro entitlement");
  }

  // ── Offering ──
  let offering: Offering | undefined;
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOfferingsError) throw new Error("Failed to list offerings");

  const existingOffering = existingOfferings.items?.find((o) => o.lookup_key === OFFERING_IDENTIFIER);
  if (existingOffering) {
    console.log("Offering already exists:", existingOffering.id);
    offering = existingOffering;
  } else {
    const { data: newOffering, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create offering");
    console.log("Created offering:", newOffering.id);
    offering = newOffering;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Set offering as current");
  }

  // ── Packages ──
  const { data: existingPackages, error: listPackagesError } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 20 },
  });
  if (listPackagesError) throw new Error("Failed to list packages");

  for (let i = 0; i < PRODUCTS.length; i++) {
    const prod = PRODUCTS[i];
    const ids = productIds[i];

    let pkg: Package | undefined = existingPackages.items?.find((p) => p.lookup_key === prod.packageIdentifier);
    if (!pkg) {
      const { data: newPackage, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: { lookup_key: prod.packageIdentifier, display_name: prod.packageDisplayName },
      });
      if (error) throw new Error(`Failed to create ${prod.key} package`);
      console.log(`Created ${prod.key} package:`, newPackage.id);
      pkg = newPackage;
    } else {
      console.log(`${prod.key} package already exists:`, pkg.id);
    }

    const { error: attachPkgError } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: [
          { product_id: ids.testStore, eligibility_criteria: "all" },
          { product_id: ids.appStore, eligibility_criteria: "all" },
          { product_id: ids.playStore, eligibility_criteria: "all" },
        ],
      },
    });
    if (attachPkgError) {
      if (attachPkgError.type === "unprocessable_entity_error") {
        console.log(`${prod.key} package already has products attached`);
      } else {
        throw new Error(`Failed to attach products to ${prod.key} package`);
      }
    } else {
      console.log(`Attached products to ${prod.key} package`);
    }
  }

  // ── API Keys ──
  const { data: testKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: testApp.id } });
  const { data: appStoreKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: appStoreApp.id } });
  const { data: playStoreKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: playStoreApp.id } });

  console.log("\n====================");
  console.log("Mosaic Beats RevenueCat setup complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", testApp.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("Entitlement:", ENTITLEMENT_IDENTIFIER);
  console.log("Public API Keys - Test Store:", testKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("Public API Keys - App Store:", appStoreKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("Public API Keys - Play Store:", playStoreKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("====================\n");
  console.log("Next: Store the API keys and IDs as environment variables.");
  console.log("  EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=<test store key>");
  console.log("  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=<app store key>");
  console.log("  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=<play store key>");
  console.log("  REVENUECAT_PROJECT_ID=" + project.id);
  console.log("  REVENUECAT_TEST_STORE_APP_ID=" + testApp.id);
  console.log("  REVENUECAT_APPLE_APP_STORE_APP_ID=" + appStoreApp.id);
  console.log("  REVENUECAT_GOOGLE_PLAY_STORE_APP_ID=" + playStoreApp.id);
}

seedRevenueCat().catch(console.error);
