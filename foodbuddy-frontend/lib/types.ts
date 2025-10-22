export type Deal = {
  id: string;
  title: string;
  description?: string;
  validFrom?: string;
  validTo?: string;
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
