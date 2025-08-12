export interface Channel {
  id: string;
  channel_name: string;
}

export interface Topic {
  id: string;
  topic_name: string;
  channel_id: string;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  image_url?: string;
  user_id: string;
  likes?: number;
  dislikes?: number;
}

export interface Invite {
  id: string;
  email: string;
  status: string;
  invited_at: string;
}

export interface Task {
  id: string;
  title: string;
  due_date: string;
}
