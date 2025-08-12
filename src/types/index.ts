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
  organization_id: string;
  channel_id?: string;
  topic_id?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes?: number;
  dislikes?: number;
}

// Legacy note interface for backward compatibility
export interface LegacyNote {
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

// Channel types
export interface Channel {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Topic types
export interface Topic {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  channel_id: string;
  created_at: string;
  updated_at: string;
}

// Subject types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  user: User;
  organization: Organization;
  role: "user" | "owner";
  joinedAt: Date;
  invitedBy: string;
  invitedByUser?: User;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  organizationId: string;
  organization: Organization;
  invitedById: string;
  invitedBy: User;
  role: "user" | "owner";
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  expiresAt: Date;
}

// Form types
export interface CreateOrganizationForm {
  name: string;
}

export interface InviteUserForm {
  email: string;
  role: "user" | "owner";
}

export interface CreateChannelForm {
  name: string;
  description?: string;
  organization_id: string;
}

export interface CreateTopicForm {
  name: string;
  description?: string;
  organization_id: string;
  channel_id: string;
}

export interface CreateNoteForm {
  title: string;
  content: string;
  organization_id: string;
  channel_id?: string;
  topic_id?: string;
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
}

export interface RegisterForm {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface NoteForm {
  title: string;
  content: string;
  subject: string;
  tags: string[];
  isPublic: boolean;
}
