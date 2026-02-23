// Shop-specific configuration for Shopify-free mode
// You can re-enable this by adding your Shopify credentials to environment variables
export const client = {
  request: async () => ({ data: { products: { edges: [] } } })
};

export const GRAPHQL_ENDPOINT = '';
