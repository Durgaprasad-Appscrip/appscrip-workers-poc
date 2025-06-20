import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            The product you're looking for doesn't exist or may have been removed.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Button>
          </Link>
          <Link href="/">
            <Button>
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}