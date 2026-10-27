export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface Creator {
  id: string;

  name: string;

  category: string;

  subCategory: string;

  price: number;

  rating: number;

  experience: number;

  description: string;

  portfolioImages: string[];

  portfolioVideos: string[];

  totalReviews: number;

  location: string;
}

export interface Booking {
  id: string;

  customerId: string;

  creatorId: string;

  serviceType: string;

  date: string;

  time: string;

  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "completed";

  customerName: string;
}