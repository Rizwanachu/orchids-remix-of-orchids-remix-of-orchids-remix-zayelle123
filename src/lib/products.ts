import { client } from './shopify';
import { gql } from 'graphql-request';

export interface Product {
  id: string;
  handle: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage: string;
  badge?: string;
  description: string;
  details: string[];
  category: string;
}

export const allProducts: Product[] = [];

export async function fetchShopifyProducts(): Promise<Product[]> {
  const query = gql`
    {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response: any = await client.request(query);
    if (response.errors) {
      console.error('Shopify API errors:', response.errors);
      return [];
    }
    return response.products.edges.map(({ node }: any) => ({
      id: node.id,
      handle: node.handle,
      name: node.title,
      subtitle: node.productType,
      price: parseFloat(node.priceRange.minVariantPrice.amount),
      compareAt: node.compareAtPriceRange?.minVariantPrice?.amount ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount) : undefined,
      image: node.images.edges[0]?.node.url || '',
      hoverImage: node.images.edges[1]?.node.url || node.images.edges[0]?.node.url || '',
      description: node.description,
      details: [],
      category: node.productType.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return [];
  }
}

export function getProductByHandle(handle: string): Product | undefined {
  return allProducts.find((p) => p.handle === handle);
}
