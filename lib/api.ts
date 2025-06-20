// API utilities for TrulyFreeHome integration
// Includes IP detection, guest token authentication, and seller data fetching

interface IPResponse {
  ip: string;
}

interface GuestTokenResponse {
  data: {
    sid: string;
    storeCategory: any[];
    type: string;
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    postal: string;
    timezone: string;
    location: {
      lat: string;
      long: string;
    };
    token: {
      accessExpireAt: number;
      accessToken: string;
      refreshToken: string;
    };
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
  asin?: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

interface BrandData {
  official_brand_name: string;
  brand_info: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    addressArea: string;
    city: string;
  };
  brand_logo: any;
  contact_email: string;
  phone_number: string;
  profile_type: string;
  shopify_id: string | null;
  social_links: {
    facebook: string;
  };
  website: string;
  brand_website_url: string;
}

interface AmazonSellerData {
  brand_name: string;
  products: AmazonProduct[];
}

interface SellerInfo {
  _id: string;
  request_id: string;
  account_status: string;
  amazon_data: AmazonSellerData;
  brand_data: BrandData;
  created_at: string;
}

interface SellerDataResponse {
  message: string;
  data: SellerInfo[];
}

interface AmazonProduct {
  asin: string;
  product_title: string;
  product_price: string;
  product_photo: string;
  product_availability: string;
  product_url: string;
  currency: string;
}

interface AmazonProductsResponse {
  products: AmazonProduct[];
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.trulyfreehome.dev';
const IP_API_URL = 'https://api.ipify.org/?format=json';
const GUEST_TOKEN_CACHE_KEY = 'tfh-guest-token';
const GUEST_TOKEN_TTL = 600; // 10 minutes

/**
 * Check if caches API is available (for edge environments)
 */
function isCachesAPIAvailable(): boolean {
  try {
    return typeof caches !== 'undefined' && caches !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get cached token if available
 */
async function getCachedToken(): Promise<string | null> {
  if (!isCachesAPIAvailable()) {
    console.log('🔐 [CACHE] Caches API not available, skipping cache check');
    return null;
  }

  try {
    const cache = await caches.open('guest-token-cache');
    const cacheRequest = new Request(`${API_BASE_URL}/cache/${GUEST_TOKEN_CACHE_KEY}`);
    const cachedResponse = await cache.match(cacheRequest);
    
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      console.log('🔐 [CACHE] Found cached token data:', JSON.stringify(cachedData, null, 2));
      
      if (cachedData.token && cachedData.expires > Date.now()) {
        console.log('🔐 [CACHE] ✅ Using cached guest token (valid until:', new Date(cachedData.expires).toISOString(), ')');
        return cachedData.token;
      } else {
        console.log('🔐 [CACHE] 🔄 Cached token expired, will fetch new one...');
      }
    } else {
      console.log('🔐 [CACHE] 🔄 No cached token found, will fetch new one...');
    }
  } catch (error) {
    console.error('🔐 [CACHE] ❌ Error checking cache:', error);
  }

  return null;
}

/**
 * Cache token for future use
 */
async function cacheToken(token: string): Promise<void> {
  if (!isCachesAPIAvailable()) {
    console.log('🔐 [CACHE] Caches API not available, skipping token caching');
    return;
  }

  try {
    const cache = await caches.open('guest-token-cache');
    const cacheRequest = new Request(`${API_BASE_URL}/cache/${GUEST_TOKEN_CACHE_KEY}`);
    const cacheData = {
      token: token,
      expires: Date.now() + (GUEST_TOKEN_TTL * 1000),
    };
    
    const cacheResponse = new Response(JSON.stringify(cacheData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${GUEST_TOKEN_TTL}`,
      },
    });
    
    await cache.put(cacheRequest, cacheResponse);
    console.log('🔐 [CACHE] ✅ Token cached successfully');
  } catch (error) {
    console.error('🔐 [CACHE] ❌ Error caching token:', error);
  }
}

/**
 * Step 1: Get user's IP address
 */
export async function getUserIP(): Promise<string> {
  console.log('🌐 [STEP 1] Starting IP address fetch...');
  console.log('🌐 [STEP 1] IP API URL:', IP_API_URL);
  
  try {
    const requestHeaders = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
    };
    
    console.log('🌐 [STEP 1] Request headers:', JSON.stringify(requestHeaders, null, 2));
    
    const response = await fetch(IP_API_URL, {
      headers: requestHeaders
    });

    console.log('🌐 [STEP 1] Response status:', response.status);
    console.log('🌐 [STEP 1] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('🌐 [STEP 1] ❌ Failed to fetch IP:', response.status, response.statusText);
      throw new Error(`Failed to fetch IP: ${response.status}`);
    }

    const data: IPResponse = await response.json();
    console.log('🌐 [STEP 1] ✅ IP response data:', JSON.stringify(data, null, 2));
    console.log('🌐 [STEP 1] ✅ Successfully fetched IP:', data.ip);
    
    return data.ip;
  } catch (error) {
    console.error('🌐 [STEP 1] ❌ Error fetching IP:', error);
    const fallbackIP = '152.59.204.243';
    console.log('🌐 [STEP 1] 🔄 Using fallback IP:', fallbackIP);
    return fallbackIP;
  }
}

/**
 * Step 2: Get guest token using the CORRECT endpoint
 */
export async function getGuestToken(): Promise<string> {
  console.log('🔐 [STEP 2] Starting guest token fetch...');
  console.log('🔐 [STEP 2] API Base URL:', API_BASE_URL);
  
  try {
    // Try to get token from cache first
    const cachedToken = await getCachedToken();
    if (cachedToken) {
      return cachedToken;
    }

    // Get user's IP address
    console.log('🔐 [STEP 2] Getting user IP address...');
    const ipAddress = await getUserIP();
    
    // Generate unique device ID for each request
    const deviceId = crypto.randomUUID();
    const deviceTime = Date.now().toString();

    const requestBody = {
      deviceId,
      ipAddress,
      appVersion: '1.0.0',
      deviceMake: 'Google Inc.',
      deviceModel: 'MacIntel 1470x956',
      deviceOsVersion: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      deviceType: 3,
      deviceTime
    };

    const requestHeaders = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'content-type': 'application/json',
      'currencycode': 'INR',
      'currencysymbol': '4oK5',
      'language': 'en',
      'platform': '3'
    };

    // Using the CORRECT endpoint you provided
    const tokenUrl = `${API_BASE_URL}/v1/guest/signIn`;
    
    console.log('🔐 [STEP 2] Token request URL:', tokenUrl);
    console.log('🔐 [STEP 2] Request headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('🔐 [STEP 2] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    console.log('🔐 [STEP 2] Response status:', response.status);
    console.log('🔐 [STEP 2] Response status text:', response.statusText);
    console.log('🔐 [STEP 2] Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to read response body regardless of status
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('🔐 [STEP 2] Raw response body:', responseText);
    } catch (bodyError) {
      console.error('🔐 [STEP 2] ❌ Failed to read response body:', bodyError);
    }

    if (!response.ok) {
      console.error('🔐 [STEP 2] ❌ Failed to fetch guest token:', response.status, response.statusText);
      console.error('🔐 [STEP 2] ❌ Response body:', responseText);
      throw new Error(`Failed to fetch guest token: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response
    let data: GuestTokenResponse;
    try {
      data = JSON.parse(responseText);
      console.log('🔐 [STEP 2] ✅ Parsed token response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('🔐 [STEP 2] ❌ Failed to parse JSON response:', parseError);
      console.error('🔐 [STEP 2] ❌ Raw response was:', responseText);
      throw new Error('Invalid JSON response from guest token API');
    }
    
    if (!data.data?.token?.accessToken) {
      console.error('🔐 [STEP 2] ❌ Invalid guest token response: missing accessToken');
      console.error('🔐 [STEP 2] ❌ Response data:', JSON.stringify(data, null, 2));
      throw new Error('Invalid guest token response: missing accessToken');
    }

    console.log('🔐 [STEP 2] ✅ Successfully received guest token:', data.data.token.accessToken.substring(0, 20) + '...');

    // Cache the token for future use
    await cacheToken(data.data.token.accessToken);

    return data.data.token.accessToken;
  } catch (error) {
    console.error('🔐 [STEP 2] ❌ Error fetching guest token:', error);
    throw new Error('Failed to authenticate with API');
  }
}

/**
 * Step 3: Get seller data using the guest token
 */
export async function getSellerData(requestId?: string): Promise<SellerDataResponse> {
  console.log('🏪 [STEP 3] Starting seller data fetch...');
  
  // Use provided request ID or default to a known working one
  const finalRequestId = requestId || '31b88e54-acc9-4eee-8d45-e7e6410c448e';
  console.log('🏪 [STEP 3] Request ID:', finalRequestId);
  
  try {
    console.log('🏪 [STEP 3] Getting guest token...');
    const token = await getGuestToken();
    console.log('🏪 [STEP 3] Token---------->:', token);
    const requestHeaders = {
      'accept': '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'authorization': token,
      'currencycode': 'USD',
      'currencysymbol': '$',
      'language': 'en',
      'platform': '3'
    };

    const sellerUrl = `${API_BASE_URL}/api/v1/ai/get_seller_data_by_request_id?request_id=${finalRequestId}`;
    
    console.log('🏪 [STEP 3] Seller data URL:', sellerUrl);
    console.log('🏪 [STEP 3] Request headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('🏪 [STEP 3] Using token:', token.substring(0, 20) + '...');

    const response = await fetch(sellerUrl, {
      headers: requestHeaders
    });

    console.log('🏪 [STEP 3] Response status:', response.status);
    console.log('🏪 [STEP 3] Response status text:', response.statusText);
    console.log('🏪 [STEP 3] Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to read response body regardless of status
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('🏪 [STEP 3] Raw response body:', responseText);
    } catch (bodyError) {
      console.error('🏪 [STEP 3] ❌ Failed to read response body:', bodyError);
    }

    if (!response.ok) {
      console.error('🏪 [STEP 3] ❌ Failed to fetch seller data:', response.status, response.statusText);
      console.error('🏪 [STEP 3] ❌ Response body:', responseText);
      throw new Error(`Failed to fetch seller data: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response
    let data: SellerDataResponse;
    try {
      data = JSON.parse(responseText);
      console.log('🏪 [STEP 3] ✅ Parsed seller data response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('🏪 [STEP 3] ❌ Failed to parse JSON response:', parseError);
      console.error('🏪 [STEP 3] ❌ Raw response was:', responseText);
      throw new Error('Invalid JSON response from seller data API');
    }

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error('🏪 [STEP 3] ❌ Invalid seller data response: data array is empty or missing');
      console.error('🏪 [STEP 3] ❌ Response data:', JSON.stringify(data, null, 2));
      throw new Error('Invalid seller data response: data array is empty or missing');
    }

    const sellerInfo = data.data[0];

    console.log('🏪 [STEP 3] ✅ Successfully fetched seller data for:', sellerInfo.brand_data.official_brand_name);
    console.log('🏪 [STEP 3] ✅ Product count:', sellerInfo.amazon_data.products.length);
    console.log('🏪 [STEP 3] ✅ Products ASINs:', sellerInfo.amazon_data.products.map(p => p.asin));

    return data;
  } catch (error) {
    console.error('🏪 [STEP 3] ❌ Error fetching seller data:', error);
    throw error;
  }
}

/**
 * Step 4: Get Amazon product data using ASINs
 */
export async function getAmazonProductData(asins: string[]): Promise<AmazonProductsResponse> {
  console.log('🛒 [STEP 4] Starting Amazon product data fetch...');
  console.log('🛒 [STEP 4] ASINs to fetch:', asins);
  
  // Check if ASINs array is empty or invalid
  if (!asins || asins.length === 0) {
    console.log('🛒 [STEP 4] ⚠️ No ASINs provided, returning empty product list');
    return {
      products: [],
      total: 0
    };
  }

  // Filter out empty or invalid ASINs
  const validAsins = asins.filter(asin => asin && asin.trim().length > 0);
  if (validAsins.length === 0) {
    console.log('🛒 [STEP 4] ⚠️ No valid ASINs found, returning empty product list');
    return {
      products: [],
      total: 0
    };
  }

  console.log('🛒 [STEP 4] Valid ASINs:', validAsins);
  
  try {
    console.log('🛒 [STEP 4] Getting guest token...');
    const token = await getGuestToken();
    
    const requestHeaders = {
      'accept': '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'authorization': token,
      'content-type': 'application/json',
      'currencycode': 'USD',
      'currencysymbol': '$',
      'language': 'en',
      'platform': '3'
    };

    const requestBody = {
      asins: validAsins
    };

    const amazonUrl = `${API_BASE_URL}/api/v1/amazon/products`;
    
    console.log('🛒 [STEP 4] Amazon products URL:', amazonUrl);
    console.log('🛒 [STEP 4] Request headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('🛒 [STEP 4] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(amazonUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    console.log('🛒 [STEP 4] Response status:', response.status);
    console.log('🛒 [STEP 4] Response status text:', response.statusText);
    console.log('🛒 [STEP 4] Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to read response body regardless of status
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('🛒 [STEP 4] Raw response body:', responseText);
    } catch (bodyError) {
      console.error('🛒 [STEP 4] ❌ Failed to read response body:', bodyError);
    }

    if (!response.ok) {
      console.error('🛒 [STEP 4] ❌ Failed to fetch Amazon product data:', response.status, response.statusText);
      console.error('🛒 [STEP 4] ❌ Response body:', responseText);
      throw new Error(`Failed to fetch Amazon product data: ${response.status}`);
    }

    // Parse JSON response
    let data: AmazonProductsResponse;
    try {
      data = JSON.parse(responseText);
      console.log('🛒 [STEP 4] ✅ Parsed Amazon products response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('🛒 [STEP 4] ❌ Failed to parse JSON response:', parseError);
      console.error('🛒 [STEP 4] ❌ Raw response was:', responseText);
      throw new Error('Invalid JSON response from Amazon products API');
    }

    console.log('🛒 [STEP 4] ✅ Successfully fetched', data.products?.length || 0, 'Amazon products');
    return data;
  } catch (error) {
    console.error('🛒 [STEP 4] ❌ Error fetching Amazon product data:', error);
    throw error;
  }
}

/**
 * Convert Amazon product data to our Product format
 */
function convertAmazonDataToProducts(amazonProducts: AmazonProduct[]): Product[] {
  console.log('🔄 [CONVERT] Converting Amazon data to products...');
  console.log('🔄 [CONVERT] Amazon products count:', amazonProducts.length);
  
  const products: Product[] = amazonProducts.map((amazonProduct, index) => {
    const priceString = amazonProduct.product_price ? amazonProduct.product_price.replace('$', '') : '0';
    const price = parseFloat(priceString) || 0;

    const inStock = amazonProduct.product_availability ? !amazonProduct.product_availability.toLowerCase().includes('out of stock') : true;

    const convertedProduct: Product = {
      id: amazonProduct.asin,
      name: amazonProduct.product_title || `Product ${index + 1}`,
      price: price,
      description: 'No description available',
      image: amazonProduct.product_photo || `https://images.pexels.com/photos/${3825572 + index}/pexels-photo-${3825572 + index}.jpeg?auto=compress&cs=tinysrgb&w=800`,
      category: 'General',
      inStock: inStock,
      asin: amazonProduct.asin
    };
    
    console.log('🔄 [CONVERT] Created product:', JSON.stringify(convertedProduct, null, 2));
    return convertedProduct;
  });

  console.log('🔄 [CONVERT] ✅ Converted', products.length, 'products');
  return products;
}

/**
 * Direct Amazon products fetch with hardcoded ASINs
 * This bypasses the seller data step for faster product loading
 */
export async function getProductsDirect(): Promise<ProductsResponse> {
  console.log('📦 [GET_PRODUCTS_DIRECT] Starting direct products fetch...');
  
  // Hardcoded ASINs - you can replace these with your actual product ASINs
  const hardcodedAsins = [
    'B08N5WRWNW', // Example ASINs - replace with your actual products
    'B08N5WRWNW',
    'B08N5WRWNW'
  ];
  
  console.log('📦 [GET_PRODUCTS_DIRECT] Using hardcoded ASINs:', hardcodedAsins);
  
  try {
    console.log('📦 [GET_PRODUCTS_DIRECT] Fetching Amazon product data...');
    const amazonProductsResponse = await getAmazonProductData(hardcodedAsins);
    
    console.log('📦 [GET_PRODUCTS_DIRECT] Converting Amazon data to products...');
    const products = convertAmazonDataToProducts(amazonProductsResponse.products || []);
    
    const response = {
      products,
      total: products.length,
      page: 1,
      limit: 20
    };

    console.log('📦 [GET_PRODUCTS_DIRECT] ✅ Final direct products response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('📦 [GET_PRODUCTS_DIRECT] ❌ Error fetching products directly:', error);
    throw error;
  }
}

/**
 * Fetches products list using real-time data from TrulyFreeHome API
 */
export async function getProducts(): Promise<ProductsResponse> {
  console.log('📦 [GET_PRODUCTS] Starting real-time products fetch...');
  
  try {
    console.log('📦 [GET_PRODUCTS] Fetching seller data with product details...');
    const sellerDataResponse = await getSellerData();
    
    const amazonProducts = sellerDataResponse.data[0]?.amazon_data?.products;

    if (!amazonProducts || amazonProducts.length === 0) {
      console.log('📦 [GET_PRODUCTS] ⚠️ No products found in seller data, returning empty list');
      return {
        products: [],
        total: 0,
        page: 1,
        limit: 20
      };
    }
    
    console.log('📦 [GET_PRODUCTS] Converting product data from seller response...');
    const products = convertAmazonDataToProducts(amazonProducts);
    
    const response = {
      products,
      total: products.length,
      page: 1,
      limit: 20
    };

    console.log('📦 [GET_PRODUCTS] ✅ Final real-time products response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('📦 [GET_PRODUCTS] ❌ Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetches single product by ID using real-time data from TrulyFreeHome API
 */
export async function getProduct(id: string): Promise<Product> {
  console.log('🔍 [GET_PRODUCT] Starting real-time single product fetch for ID:', id);
  
  console.log('🔍 [GET_PRODUCT] Fetching all products...');
  const productsResponse = await getProducts();
  
  console.log('🔍 [GET_PRODUCT] Searching for product with ID/ASIN:', id);
  const product = productsResponse.products.find(p => p.id === id || p.asin === id);
  
  if (!product) {
    console.error('🔍 [GET_PRODUCT] ❌ Product not found with ID/ASIN:', id);
    console.log('🔍 [GET_PRODUCT] Available products:', productsResponse.products.map(p => ({ id: p.id, asin: p.asin })));
    throw new Error('Product not found');
  }
  
  console.log('🔍 [GET_PRODUCT] ✅ Found product:', JSON.stringify(product, null, 2));
  return product;
}