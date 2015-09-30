var conString = "postgres://postgres@localhost/tng";
var knex = require('knex')({
  client: 'pg',
  connection: conString,
  pool: {
    min: 1,
    max: 10,
  }
})
var bookshelf = require('bookshelf')(knex)

var EpisodeTag = bookshelf.Model.extend({
  tableName: 'episode_tags'
})
var Tag = bookshelf.Model.extend({
  tableName: 'tags',
  episodeTags: function(){
    return this.belongsToMany(EpisodeTag)
  },
  episodes: function(){
    return this.belongsToMany(Episode).through(EpisodeTag)
  }
})
var Episode = bookshelf.Model.extend({
  tableName: 'episodes',
  episodeTags: function(){
    return this.belongsToMany(EpisodeTag)
  },
  tags: function(){
    return this.belongsToMany(Tag).through(EpisodeTag)
  }
})

module.exports = {
  Episode: Episode,
  Tag: Tag,
  EpisodeTag: EpisodeTag,
  knex: knex,
  bookshelf: bookshelf
}
