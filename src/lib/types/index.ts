// Auth types
export type UserRole = 'SUPERADMIN' | 'EDITOR' | 'AUTHOR';
export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type ContentType = 'MARKDOWN' | 'HTML';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  articleCount: number;
}

export interface ArticleResponse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentType: ContentType;
  seoTitle: string | null;
  seoDescription: string | null;
  coverImage: string | null;
  views: number;
  readTime: number | null;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string };
  tags: { id: string; name: string; slug: string }[];
  category?: { id: string; name: string; slug: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface DashboardStats {
  totalViews: number;
  totalArticles: number;
  visitorsToday: number;
  aiDraftQueue: number;
}

// Form types
export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  contentType: ContentType;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  categoryId?: string;
  tags: string[];
  status: ArticleStatus;
}

// AI generation types
export interface AIArticleResult {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}