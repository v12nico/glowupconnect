export type GlowCategory = 'fitness' | 'mental_health' | 'style' | 'weight_loss' | 'lifestyle'
export type UserGender   = 'man' | 'woman' | 'nonbinary' | 'unspecified'
export type SwipeDir     = 'like' | 'pass'

export interface Profile {
  id:            string
  username:      string
  display_name:  string
  bio:           string | null
  gender:        UserGender
  birthdate:     string | null
  location:      string | null
  in_community:  boolean
  in_dating:     boolean
  interested_in: UserGender[]
  created_at:    string
}

export interface Transformation {
  id:         string
  user_id:    string
  before_url: string
  after_url:  string
  story:      string | null
  category:   GlowCategory
  is_primary: boolean
  created_at: string
}

export interface Like {
  user_id:           string
  transformation_id: string
  revealed_first:    boolean
  created_at:        string
}

export interface Comment {
  id:                string
  transformation_id: string
  user_id:           string
  parent_id:         string | null
  body:              string
  created_at:        string
}

export interface Swipe {
  swiper_id:      string
  swipee_id:      string
  direction:      SwipeDir
  revealed_first: boolean
  created_at:     string
}

export interface Match {
  id:         string
  user_low:   string
  user_high:  string
  created_at: string
}

export interface Message {
  id:         string
  match_id:   string
  sender_id:  string
  body:       string
  read_at:    string | null
  created_at: string
}

export interface Block {
  blocker_id: string
  blocked_id: string
  created_at: string
}

export interface Report {
  id:          string
  reporter_id: string
  target_user: string | null
  target_post: string | null
  reason:      string
  created_at:  string
}

// Comment joined with the commenter's profile
export interface CommentWithProfile extends Comment {
  profiles: Pick<Profile, 'username' | 'display_name'>
}

// Feed shape — transformation joined with profile + like count
export interface FeedPost {
  transformation: Transformation
  profile:        Profile
  like_count:     number
  comment_count:  number
  viewer_liked:   boolean
  viewer_revealed: boolean
}
