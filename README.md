# TNG Database Seeder

Enjoy the output in either sql format (`output.sql`), or json (`output.json`).

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
