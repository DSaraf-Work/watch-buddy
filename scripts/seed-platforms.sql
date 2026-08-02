INSERT OR IGNORE INTO ott_platforms (id, name, logo_url, website_url, created_at) VALUES
  ('p-netflix', 'Netflix', NULL, 'https://www.netflix.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-hotstar', 'Disney+ Hotstar', NULL, 'https://www.hotstar.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-prime', 'Amazon Prime Video', NULL, 'https://www.primevideo.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-appletv', 'Apple TV+', NULL, 'https://tv.apple.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-hbomax', 'HBO Max', NULL, 'https://www.max.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-hulu', 'Hulu', NULL, 'https://www.hulu.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-paramount', 'Paramount+', NULL, 'https://www.paramountplus.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-youtube', 'YouTube', NULL, 'https://www.youtube.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-sonyliv', 'Sony LIV', NULL, 'https://www.sonyliv.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-zee5', 'Zee5', NULL, 'https://www.zee5.com', cast(unixepoch('subsecond') * 1000 as integer)),
  ('p-voot', 'Voot', NULL, 'https://www.voot.com', cast(unixepoch('subsecond') * 1000 as integer));
