// Common types
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type Role = 'user' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceType = 'consultation' | 'styling' | 'fashion-designing';
export type ConsultationType = 'bridal' | 'wardrobe-audit' | 'personal-shopping' | 'event-styling';
export type DiscountType = 'percentage' | 'fixed';
export type BannerPosition = 'hero' | 'mid-page' | 'sidebar';
export type NewsletterStatus = 'draft' | 'sending' | 'sent' | 'failed';

// User
export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  preferredCurrency: Currency;
  preferredLanguage: 'en' | 'fr';
  isActive: boolean;
  lastLoginAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Category
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentCategory?: string;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Product Variant
export interface ProductVariant {
  _id?: string;
  size: string;
  color?: string;
  material?: string;
  stock: number;
  sku: string;
}

// Product
export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string | ICategory;
  prices: {
    NGN: number;
    USD: number;
    GBP: number;
    EUR: number;
  };
  heroImage: string;
  gallery: string[];
  variants: ProductVariant[];
  tags: string[];
  badges?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  totalSold: number;
  totalStock?: number;
  originalPrice?: number;
  sku?: string;
  rating?: number;
  ratingCount?: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item
export interface OrderItem {
  product: string;
  name: string;
  heroImage: string;
  variant: {
    size: string;
    color?: string;
    material?: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  currency: Currency;
}

// Order Timeline
export interface OrderTimeline {
  status: string;
  message: string;
  timestamp: Date;
  updatedBy: string;
}

// Order
export interface IOrder {
  _id: string;
  orderNumber: string;
  user?: string;
  email: string; // Always store email at top level for guest and registered users
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  currency: Currency;
  discountCode?: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paystackTransactionId?: string;
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  timeline: OrderTimeline[];
  notes?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Cart
export interface CartItem {
  _id?: string;
  product: IProduct | string;
  variant: {
    size: string;
    color?: string;
    material?: string;
    sku: string;
  };
  quantity: number;
  price: number;
  currency: Currency;
}

export interface ICart {
  _id: string;
  user?: string;
  // sessionId?: string;
  items: CartItem[];
  updatedAt: Date;
}

// Wishlist
export interface IWishlist {
  _id: string;
  user: string;
  products: string[];
  updatedAt: Date;
}

// Service
export interface IService {
  _id: string;
  name: string;
  slug: string;
  type: ServiceType;
  consultationType?: ConsultationType;
  description: string;
  shortDescription: string;
  image: string;
  prices: {
    NGN: number;
    USD: number;
    GBP: number;
    EUR: number;
  };
  duration: number;
  isAvailable: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Booking
export interface IBooking {
  _id: string;
  bookingNumber: string;
  user?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  service: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: BookingStatus;
  notes?: string;
  adminNotes?: string;
  total: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Banner
export interface IBanner {
  _id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  mobileImage?: string;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Discount
export interface IDiscount {
  _id: string;
  code: string;
  type: DiscountType;
  value: number;
  currency: Currency | 'all';
  minimumOrderValue: number;
  maxUsageCount?: number;
  usedCount: number;
  usedBy: string[];
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Newsletter Subscriber
export interface INewsletter {
  _id: string;
  email: string;
  name?: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

// Newsletter Campaign
export interface INewsletterCampaign {
  _id: string;
  subject: string;
  previewText: string;
  htmlContent: string;
  sentAt?: Date;
  recipientCount: number;
  status: NewsletterStatus;
  sentBy: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Size Guide
export interface SizeChartRow {
  size: string;
  chest_cm: number;
  waist_cm: number;
  hips_cm: number;
  chest_in: number;
  waist_in: number;
  hips_in: number;
}

export interface ISizeGuide {
  _id: string;
  title: string;
  description: string;
  chart: SizeChartRow[];
  updatedAt: Date;
}

// Exchange Rate Cache
export interface IExchangeRateCache {
  _id: string;
  baseCurrency: 'USD';
  rates: {
    NGN: number;
    GBP: number;
    EUR: number;
    USD: number;
  };
  fetchedAt: Date;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Session User
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  preferredCurrency: Currency;
  preferredLanguage: 'en' | 'fr';
}

export interface JwtPayload {
  id: string;
  email: string
}


export interface FormDataType {
  code: string;
  type: "percentage";
  value: number;
  currency: "NGN";
  minimumOrderValue: number;
  maxUsageCount: number | undefined;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}