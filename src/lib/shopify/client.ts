// Real Shopify Admin API client for the Chat agent's product catalog
// (Haven Home Tech, a real Shopify dev store seeded with IoT products).
//
// Dev Dashboard apps (created after Jan 1 2026) don't issue a static
// shpat_ token -- they use a client-credentials grant that expires in
// roughly 24h. Rather than persist and refresh a token across serverless
// invocations, this fetches a fresh token on demand and caches it
// in-memory for the lifetime of the function instance, refreshing a
// little before it actually expires.

const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN ?? "haven-home-tech.myshopify.com";
const ADMIN_API_VERSION = "2026-07";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET are not configured.");
  }

  const response = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify token exchange failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

async function adminGraphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(
    `https://${SHOP_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify Admin API error (${response.status}): ${text}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`Shopify Admin API GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

export type ShopifyDevice = {
  id: string;
  title: string;
  productType: string;
  description: string;
  priceUsd: number;
  tags: string[];
  imageUrl: string | null;
};

const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query SearchProducts($query: String!) {
    products(first: 25, query: $query) {
      edges {
        node {
          id
          title
          productType
          description
          tags
          priceRangeV2 {
            minVariantPrice {
              amount
            }
          }
          featuredImage {
            url
          }
        }
      }
    }
  }
`;

// Fetches the whole Haven Home Tech catalog (vendor-pinned so a shared/dev
// store could later hold other agents' catalogs without cross-contaminating
// results). Deliberately not filtered by Shopify's own query syntax here --
// letting the LLM write `tag:no-wiring-required`-style filters was fragile
// in practice (Shopify's search parser doesn't reliably match hyphenated
// multi-word tag values that way, and there was no fallback when a filtered
// query returned zero results). Matching against customer intent now
// happens in code instead, in src/lib/chat/tools.ts, same pattern already
// used for the troubleshooting/policy KBs.
export async function fetchAllDevices(): Promise<ShopifyDevice[]> {
  const data = await adminGraphql<{
    products: {
      edges: {
        node: {
          id: string;
          title: string;
          productType: string;
          description: string;
          tags: string[];
          priceRangeV2: { minVariantPrice: { amount: string } };
          featuredImage: { url: string } | null;
        };
      }[];
    };
  }>(SEARCH_PRODUCTS_QUERY, { query: `vendor:"Haven Home Tech"` });

  return data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    productType: node.productType,
    description: node.description,
    priceUsd: parseFloat(node.priceRangeV2.minVariantPrice.amount),
    tags: node.tags,
    imageUrl: node.featuredImage?.url ?? null,
  }));
}
