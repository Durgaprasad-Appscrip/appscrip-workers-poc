# Cursor AI Prompt for TrulyFreeHome Real-time API Integration

## Project Overview
This is a Next.js 13+ eCommerce application that needs to integrate with the TrulyFreeHome API to fetch real-time product data. The application should NEVER use mock data - only real-time data from the API.

## Current Issues
1. API authentication is failing with guest token requests
2. The application falls back to mock data instead of fixing the real API integration
3. Server-side rendering errors with client component event handlers
4. Need to properly handle API errors without using fallback mock data

## API Flow Requirements
The application must follow this exact API flow:

### Step 1: Get Guest Token
```
POST https://api.trulyfreehome.dev/auth/guest-token
Headers:
- Content-Type: application/json
- accept: application/json, text/plain, */*
- accept-language: en-GB,en-US;q=0.9,en;q=0.8
- currencycode: INR
- currencysymbol: 4oK5
- language: en
- platform: 3

Body:
{
  "deviceId": "generated-uuid",
  "ipAddress": "user-ip-from-ipify",
  "appVersion": "1.0.0",
  "deviceMake": "Google Inc.",
  "deviceModel": "MacIntel 1470x956",
  "deviceOsVersion": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  "deviceType": 3,
  "deviceTime": "timestamp"
}

Expected Response:
{
  "token": "jwt-token-string"
}
```

### Step 2: Get Available Request IDs
```
GET https://api.trulyfreehome.dev/api/v1/ai/get_all_request_ids
Headers:
- Authorization: Bearer {token}
- accept: */*
- accept-language: en-GB,en-US;q=0.9,en;q=0.8
- currencycode: USD
- currencysymbol: $
- language: en
- platform: 3

Expected Response:
{
  "data": ["request-id-1", "request-id-2", ...]
}
```

### Step 3: Get Seller Data
```
GET https://api.trulyfreehome.dev/api/v1/ai/get_seller_data_by_request_id?request_id={request_id}
Headers:
- Authorization: Bearer {token}
- accept: */*
- accept-language: en-GB,en-US;q=0.9,en;q=0.8
- currencycode: USD
- currencysymbol: $
- language: en
- platform: 3

Expected Response:
{
  "data": {
    "official_brand_name": "Brand Name",
    "products": [
      {"asin": "B071DR7GLW"},
      {"asin": "B0RNWQMYG"},
      ...
    ],
    ...
  },
  "request_id": "request-id"
}
```

### Step 4: Get Amazon Product Data
```
POST https://api.trulyfreehome.dev/api/v1/amazon/products
Headers:
- Authorization: Bearer {token}
- Content-Type: application/json
- accept: */*
- accept-language: en-GB,en-US;q=0.9,en;q=0.8
- currencycode: USD
- currencysymbol: $
- language: en
- platform: 3

Body:
{
  "asins": ["B071DR7GLW", "B0RNWQMYG", ...]
}

Expected Response:
{
  "products": [
    {
      "asin": "B071DR7GLW",
      "title": "Product Name",
      "price": {
        "current_price": 29.99,
        "currency": "USD"
      },
      "images": ["image-url"],
      "description": "Product description",
      "availability": {
        "in_stock": true
      },
      "category": "Personal Care"
    },
    ...
  ],
  "total": 4
}
```

## Key Requirements

### 1. NO MOCK DATA
- Remove ALL mock data fallbacks from the main application flow
- Only use real-time API data
- If API fails, show proper error messages with retry functionality
- Do NOT create fake/placeholder products

### 2. Proper Error Handling
- Show user-friendly error messages when API fails
- Provide retry buttons that actually retry the API calls
- Log detailed error information for debugging
- Handle network timeouts and connection issues

### 3. Fix Server Component Issues
- The homepage (`app/page.tsx`) is a Server Component
- Cannot use client-side event handlers like `onClick` in Server Components
- Create separate Client Components for interactive elements
- Use proper "use client" directives where needed

### 4. API Integration Fixes Needed
- Fix the guest token authentication (currently failing)
- Ensure proper headers are sent with each request
- Handle API response parsing correctly
- Implement proper token caching for performance

### 5. Environment Configuration
```env
NEXT_PUBLIC_API_BASE_URL=https://api.trulyfreehome.dev
```

## Files to Focus On

### `lib/api.ts`
- Fix the `getGuestToken()` function to properly authenticate
- Ensure all API calls use correct headers and request format
- Remove mock data fallbacks from main functions
- Add proper error handling and logging

### `app/page.tsx`
- Fix Server Component issues with event handlers
- Show proper error states when API fails
- Remove any mock data usage

### `components/TryAgainButton.tsx`
- Create a proper Client Component for retry functionality
- Handle retry logic correctly

## Expected Behavior
1. Application loads and immediately calls the real-time API
2. If API succeeds, shows real product data from Amazon
3. If API fails, shows error message with retry button
4. Retry button makes fresh API calls (no cached failures)
5. No mock data is ever shown to users

## Debug Requirements
- Add comprehensive console logging for each API step
- Log request/response details for debugging
- Show clear error messages in the UI
- Make it easy to identify where the API integration is failing

## Success Criteria
- Application successfully fetches real-time product data
- No mock data is used in the normal application flow
- Proper error handling with user-friendly messages
- Server/Client component architecture works correctly
- API authentication and all endpoints work properly

## Instructions for Cursor AI
Please analyze the current code and fix the real-time API integration. Focus on:

1. **Fix the API authentication** - Make the guest token request work properly
2. **Remove mock data fallbacks** - Only use real-time data
3. **Fix Server Component issues** - Separate client-side interactivity properly
4. **Add proper error handling** - Show errors without falling back to mock data
5. **Test the complete API flow** - Ensure all 4 steps work correctly

Do NOT add new features or change the UI design. Focus only on making the real-time API integration work correctly.