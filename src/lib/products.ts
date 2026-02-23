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
  shippingPolicy: string;
  returnPolicy: string;
  category: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export const allProducts: Product[] = [
  {
    id: '1',
    handle: 'classic-white-tee',
    name: 'Classic White Tee',
    subtitle: 'Essentials',
    price: 35,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
    description: 'A timeless essential crafted from 100% organic cotton.',
    details: ['100% Organic Cotton', 'Pre-shrunk', 'Made in Portugal'],
    shippingPolicy: '',
    returnPolicy: '',
    category: 'essentials'
  },
  {
    id: '2',
    handle: 'denim-jacket',
    name: 'Vintage Denim Jacket',
    subtitle: 'Outerwear',
    price: 120,
    image: 'https://images.unsplash.com/photo-1576871333021-475f4a15ebb9?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1000&auto=format&fit=crop',
    description: 'Classic fit denim jacket with a vintage wash.',
    details: ['Heavyweight Denim', 'Metal Buttons', 'Reinforced Stitching'],
    shippingPolicy: '',
    returnPolicy: '',
    category: 'outerwear'
  }
];

export async function fetchShopifyProducts(): Promise<Product[]> {
  // Return mock products when Shopify is not configured
  return allProducts;
}

export function getProductByHandle(handle: string): Product | undefined {
  return allProducts.find((p) => p.handle === handle);
}
