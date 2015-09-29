CREATE TABLE episodes (
    id serial,
    num varchar(8),
    title varchar(60),
    url varchar(255),
    airdate date,
    prodno varchar(16),
    stardate varchar(8)
);

CREATE TABLE tags (
    id serial,
    title varchar(60),
    url varchar(255)
);

CREATE TABLE episode_tags (
    id serial,
    tag_id integer,
    episode_id integer
);
