export interface Review {
  id: number;
  item_id: number;
  stars: number;
  status: string;
  notes: string | null;
  date_tried: string | null;
}

export interface Item {
  id: number;
  name: string;
  restaurant: string;
  category: string;
  reviews: Review[];
}
