# TNG Database Seeder

Enjoy the output in either sql format (`output.sql`), or json (`output.json`).

## Sample Queries

Request the first 10 'holodeck' episodes:
```sql
SELECT num, title FROM episodes
WHERE id IN (
 SELECT episode_id FROM episode_tags
 WHERE tag_id IN (                                               
   SELECT id FROM tags                                           WHERE title LIKE 'holodeck'
  )
) ORDER BY stardate LIMIT 10;
```
Outputs:

```
num   |            title
---------+------------------------------
1x01/02 | Encounter at Farpoint
1x04    | Code of Honor
1x06    | Where No One Has Gone Before
1x11    | Haven
1x15    | 11001001
1x19    | Coming of Age
1x23    | Skin of Evil
1x14    | Angel One
1x24    | We'll Always Have Paris
1x25    | Conspiracy
(10 rows)
```

Request the 20 most frequent references:
```sql
SELECT tag.title, count(links.*) as frequency FROM tags tag
LEFT JOIN episode_tags links ON links.tag_id = tag.id
GROUP BY title
ORDER BY frequency desc
LIMIT 20;
```
Outputs:
```
title           | frequency
---------------------------+-----------
number one                |       119
Federation                |       106
Earth                     |        77
tricorder                 |        73
turbolift                 |        59
Starfleet Academy         |        53
red alert                 |        52
painting                  |        46
Romulan                   |        46
VISOR                     |        44
Klingon                   |        42
medical tricorder         |        37
Milky Way Galaxy          |        35
holodeck                  |        34
Ferengi                   |        29
sickbay                   |        25
Vulcan                    |        24
Unnamed plants            |        23
A Midsummer Night's Dream |        23
bridge                    |        22
(20 rows)
```

## Running script

Create a postgres database called `tng` with owner `postgres`.

Run the `init.sql` script in that database.

Have `node.js` installed on your computer.

Run `npm install` in this folder.

Run `npm start` to run the postgres database populating script.

You should now have three tables: `episodes`, `tags`, and the join table, `episode_tags`.

This output is demonstrated in `output.sql`.

To dump that sql database into a json file, run `node jsonDumper.js`.

The resulting `output.json` file is the json equivalent, in a "sideloaded" format.  Each episode has a `tag` array, of tag ids.  The format is like this:
```
{
  "episodes":[
    {
      "id": 1,
      "num": "1x01/02",
      "title": "Encounter at Farpoint",
      "url": "/wiki/Encounter_at_Farpoint_(episode)",
      "airdate": "1987-09-28T07:00:00.000Z",
      "prodno": "41153.7",
      "stardate": "41153.7",
      "tags": [
        1,
        3,
        2
      ]
    }
  ],
  "tags":[
    {
      "id": 6228,
      "title": "Skywalker Division",
      "url": "/wiki/Skywalker_Division"
    }
  ]
}
```
