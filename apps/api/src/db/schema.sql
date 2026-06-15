CREATE TABLE IF NOT EXISTS users (
  profile_pk  TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  group_name  TEXT NOT NULL DEFAULT 'todos' CHECK(group_name IN ('familia','amigos','todos')),
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_steps (
  profile_pk  TEXT NOT NULL REFERENCES users(profile_pk),
  date        TEXT NOT NULL,
  steps       INTEGER NOT NULL DEFAULT 0,
  captured_at INTEGER NOT NULL,
  PRIMARY KEY (profile_pk, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_steps(date);
CREATE INDEX IF NOT EXISTS idx_daily_user_date ON daily_steps(profile_pk, date);
