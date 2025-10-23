export type Deal = {
  id: string;
  title: string;
  description?: string;
  validFrom?: string;
  validTo?: string;
  // New fields for coupon attributes
  redemptionCode?: string;
  redemptionMethod?: 'code' | 'qr' | 'in-person' | 'app' | 'none';
  studentOnly?: boolean;
  participatingLocations?: string[]; // store ids or empty = all
  availability?: {
    dineIn?: boolean;
    takeout?: boolean;
    delivery?: boolean;
    daysOfWeek?: string[]; // e.g. ['Mon','Tue']
    timeRange?: { start: string; end: string } | null; // 24h strings like '14:00'
  } | null;
  minPurchase?: number;
  perCustomerLimit?: number;
  singleUse?: boolean;
  finePrint?: string;
  status?: 'active' | 'expired' | 'scheduled' | 'cancelled';
  lastUpdated?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  priceRange?: string;
  rating?: number;
  foodTypes?: string[];
  tags: string[];
  deals: Deal[];
};

export type RestaurantDetail = Restaurant & {
  menus: {
    id: string;
    title: string;
    items: { id: string; name: string; price: number; }[];
  }[];
  reviews?: { userName: string; rating: number; comment: string }[];
};
