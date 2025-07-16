// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  authorId: string;
  author: User;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subject types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface NoteForm {
  title: string;
  content: string;
  subject: string;
  tags: string[];
  isPublic: boolean;
}
