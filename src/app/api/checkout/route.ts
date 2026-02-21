import { NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'zayelle-2.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const lines = items.map((item: any) => ({
      merchandiseId: item.id.startsWith('gid://') ? item.id : `gid://shopify/ProductVariant/${item.id}`,
      quantity: parseInt(item.quantity, 10) || 1,
    }));

    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            lines,
          },
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Shopify API Errors:', result.errors);
      return NextResponse.json({ error: 'Shopify API Error', details: result.errors }, { status: 500 });
    }

    const { cart, userErrors } = result.data.cartCreate;

    if (userErrors && userErrors.length > 0) {
      return NextResponse.json({ error: 'User Errors', details: userErrors }, { status: 400 });
    }

    return NextResponse.json({ checkoutUrl: cart.checkoutUrl });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
