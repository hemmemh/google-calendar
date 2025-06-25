CREATE USER google_calendar WITH PASSWORD 'google_calendar' CREATEDB;
CREATE DATABASE google_calendar
    WITH
    OWNER = google_calendar
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;