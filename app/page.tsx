import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store, Zap } from 'lucide-react';
import { getProducts } from '@/lib/api';
import TryAgainButton from '@/components/TryAgainButton';

// Server component for product listing with SSR - This is now the home page
export default async function HomePage() {
  let products: any[] = [];
  let error: string | null = null;
  try {
    const response = await getProducts();
    products = response.products;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    error = 'Failed to load products. Please try again later.';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-8">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">TrulyFreeHome Store</h1>
              <p className="text-gray-600 mb-8">{error}</p>
            </div>
            <TryAgainButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TrulyFreeHome</h1>
                <p className="text-sm text-gray-600">Premium Organic Products</p>
              </div>
            </div>
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Store
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Premium Organic Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Revolutionary personal care products by eliminating harmful toxins, 
            paving the way for a cleaner, sustainable future.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-gray-800 text-white">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {product.asin && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 text-xs">
                        {product.asin}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {product.name}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="mb-3 text-xs">
                  {product.category}
                </Badge>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${(product.price || 0).toFixed(2)}
                  </span>
                  {product.inStock && (
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      In Stock
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex gap-2 w-full">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button variant="outline" className="w-full hover:bg-gray-50">
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {products.length === 0 && !error && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="w-5 h-5" />
            <span className="font-semibold">TrulyFreeHome</span>
          </div>
          <p className="text-gray-400">
            Premium organic products for a healthier lifestyle • Powered by Next.js & Cloudflare Workers
          </p>
        </div>
      </footer>
    </div>
  );
}