# Next.js eCommerce POC for Cloudflare Workers

A production-ready eCommerce platform built with Next.js App Router, TypeScript, and shadcn/ui, optimized for deployment on Cloudflare Workers using `@cloudflare/next-on-pages`.

## Features

- 🚀 **Server-Side Rendering (SSR)** with edge runtime
- 🔐 **Guest Token Authentication** with API integration
- 💾 **Edge Caching** for optimal performance
- 📱 **Responsive Design** with modern UI components
- ⚡ **Cloudflare Workers Deployment** for global distribution
- 🛡️ **TypeScript** for type safety
- 🎨 **shadcn/ui** components with Tailwind CSS

## Project Structure

```
├── app/
│   ├── products/
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Product Detail Page (PDP)
│   │   │   └── not-found.tsx     # 404 page for products
│   │   └── page.tsx              # Product Listing Page (PLP)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── lib/
│   └── api.ts                    # API utilities and authentication
├── components/ui/                # shadcn/ui components
├── wrangler.toml                 # Cloudflare Workers configuration
└── next.config.js               # Next.js configuration
```

## API Integration

The application integrates with real backend APIs using guest token authentication:

### Authentication Flow

1. **Guest Token Request**
   ```
   POST https://api.trulyfreehome.dev/auth/guest-token
   Headers: Content-Type: application/json
   Body: {}
   Response: { token: string }
   ```

2. **Product API Calls**
   ```
   GET https://api.trulyfreehome.dev/products           # Product listing
   GET https://api.trulyfreehome.dev/products/{id}      # Product details
   Headers: Authorization: Bearer <guest-token>
   ```

### Edge Caching

- Guest tokens are cached in Cloudflare's edge cache for 10 minutes
- Reduces API calls and improves performance
- Automatic cache invalidation when tokens expire

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-ecommerce-poc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.trulyfreehome.dev
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment to Cloudflare Workers

### Setup Cloudflare

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Configure your project**
   
   Update `wrangler.toml` with your account details:
   ```toml
   name = "your-app-name"
   compatibility_date = "2024-01-01"
   
   [env.production]
   NEXT_PUBLIC_API_BASE_URL = "https://api.trulyfreehome.dev"
   ```

### Build and Deploy

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   npm run deploy
   ```

3. **Preview deployment**
   ```bash
   npm run preview
   ```

### Environment Variables

Set production environment variables in Cloudflare Dashboard:

1. Go to **Cloudflare Dashboard** > **Pages** > **Your Project**
2. Navigate to **Settings** > **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_API_BASE_URL`: Your production API URL

## API Configuration

### Production API Setup

Replace the placeholder API URL in your environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.trulyfreehome.dev
```

### Mock Data Fallback

The application includes mock data for development and testing. When the real API is unavailable, it automatically falls back to mock data to ensure the application remains functional.

### Error Handling

- **Token Authentication Failures**: Graceful error handling with user-friendly messages
- **API Timeouts**: Automatic retry logic with exponential backoff
- **Network Errors**: Fallback to cached data when possible
- **Product Not Found**: Custom 404 pages with navigation options

## Performance Optimizations

### Edge Runtime

- Optimized for Cloudflare Workers edge runtime
- Minimal cold start times
- Global distribution

### Caching Strategy

- **Guest Tokens**: 10-minute edge cache
- **Static Assets**: Cached at CDN level
- **API Responses**: Optional caching for static product data

### Image Optimization

- Responsive images with proper sizing
- Lazy loading for better performance
- Optimized for Cloudflare's image processing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run preview` - Preview deployment locally

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (configure as needed)
- **Husky** for pre-commit hooks (optional)

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify environment variables are set

2. **API Connection Issues**
   - Verify API URL and authentication
   - Check network connectivity
   - Review CORS settings

3. **Deployment Failures**
   - Confirm Wrangler CLI is authenticated
   - Check Cloudflare account permissions
   - Verify project configuration

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Review the troubleshooting section
- Check Cloudflare Workers documentation
- Open an issue in the repository

---

**Note**: Replace `https://api.trulyfreehome.dev` with your actual API endpoint before deployment.