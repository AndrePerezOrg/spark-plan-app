export type Priority = 'low' | 'medium' | 'high';
export type CardStatus = 'active' | 'archived';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  background_color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  name: string;
  board_id: string;
  position: number;
  color: string;
  card_limit: number | null;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  creator_id: string;
  position: number;
  priority: Priority;
  status: CardStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
  creator?: UserProfile;
  votes?: Vote[];
  comments?: Comment[];
  vote_count?: number;
  comment_count?: number;
  user_has_voted?: boolean;
}

export interface Vote {
  id: string;
  card_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface CardWithDetails extends Card {
  creator: UserProfile;
  vote_count: number;
  comment_count: number;
  user_has_voted: boolean;
}