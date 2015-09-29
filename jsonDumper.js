var fs = require('fs')
var path = require('path')

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

getEpisodeJSONs().then(function(json){
    console.log(json);
    var outputPath = path.join(__dirname, 'output.json')
    fs.writeFileSync(outputPath, JSON.stringify(json,null,2));
    return knex.destroy();
})

function getEpisodeJSONs(){
  return new Episode().fetchAll().then(function(episodes){
    var promises = episodes.toJSON().map(joinTagList)
    return Promise.all(promises)
    .then(function(episodes){
      return new Tag().fetchAll().then(function(tags){
        return {
          episodes:episodes,
          tags: tags.toJSON()
        }
      })
    })
  })
}

function joinTagList (episode) {
  return new EpisodeTag().where({
    episode_id: episode.id
  }).fetchAll().then(function(episodeTags){
    // console.dir(episode)
    // console.dir(episodeTags)
    episode.tags = episodeTags.map(function(epTag){
      return epTag.attributes.tag_id
    })
    return episode
  });
}
