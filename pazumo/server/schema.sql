CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES users(id),
  caption TEXT NOT NULL DEFAULT '',
  media_key TEXT NOT NULL,
  status TEXT NOT NULL,
  allow_download BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE follows (
  follower_id TEXT NOT NULL REFERENCES users(id),
  following_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE reactions (
  user_id TEXT NOT NULL REFERENCES users(id),
  video_id TEXT NOT NULL REFERENCES videos(id),
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  video_id TEXT NOT NULL REFERENCES videos(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE interaction_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  video_id TEXT,
  event_type TEXT NOT NULL,
  event_value TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_videos_creator ON videos(creator_id);
CREATE INDEX idx_events_video_time ON interaction_events(video_id, created_at);
CREATE INDEX idx_reactions_video ON reactions(video_id);
