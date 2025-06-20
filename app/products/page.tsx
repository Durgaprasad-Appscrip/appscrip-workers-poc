import { redirect } from 'next/navigation';

// Redirect /products to home page since PLP is now the home page
export default function ProductsPage() {
  redirect('/');
}