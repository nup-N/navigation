export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Website {
  id: number;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: number;
  category?: Category;
  clicks: number;
  userId?: number;
  isPublic: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}