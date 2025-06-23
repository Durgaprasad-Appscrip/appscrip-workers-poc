import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft, Heart, Share2, Store } from 'lucide-react';
import { getProducts } from '@/lib/api';
import { notFound } from 'next/navigation';

// Edge Runtime configuration for Cloudflare Workers
export const runtime = 'edge';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Server component for product detail with SSR
export default async function ProductPage({ params }: ProductPageProps) {
  let product: any = null;
  let error: string | null = null;
  try {
    console.log('🔍 [GET_PRODUCT] Fetching all products...');
    const productsResponse = await getProducts();
    
    console.log('🔍 [GET_PRODUCT] Searching for product with ID/ASIN:', params.id);
    product = productsResponse.products.find(p => p.id === params.id || p.asin === params.id);
    
    if (!product) {
      console.error('🔍 [GET_PRODUCT] ❌ Product not found with ID/ASIN:', params.id);
      console.log('🔍 [GET_PRODUCT] Available products:', productsResponse.products.map(p => ({ id: p.id, asin: p.asin })));
      return notFound();
    }
    
    console.log('🔍 [GET_PRODUCT] ✅ Found product:', JSON.stringify(product, null, 2));
  } catch (err: any) {
    console.error('Failed to fetch product:', err);
    error = 'Failed to load product details. Please try again later.';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/">
              <Button variant="outline" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">TrulyFreeHome</span>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="outline">{product.category}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-gray-800 text-white text-lg px-4 py-2">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {product.asin && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-white/90">
                        ASIN: {product.asin}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-sm">
                  {product.category}
                </Badge>
                {product.inStock ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-6">
                ${(product.price || 0).toFixed(2)}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Product</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Purchase Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  className="flex-1 inline-flex items-center justify-center gap-2 text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                  size="lg"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 hover:bg-gray-50"
                  disabled={!product.inStock}
                >
                  Buy Now
                </Button>
              </div>
              
              {!product.inStock && (
                <p className="text-sm text-gray-500 text-center">
                  This item is currently out of stock. Check back later for availability.
                </p>
              )}
            </div>

            {/* Product Features */}
            <Card className="shadow-lg">
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Product Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                {product.asin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ASIN:</span>
                    <span className="font-medium text-sm">{product.asin}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-medium text-sm">{product.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}