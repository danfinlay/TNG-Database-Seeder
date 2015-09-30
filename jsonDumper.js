var fs = require('fs')
var path = require('path')

var models = require('./lib/models')
var knex = models.knex
var bookshelf = models.bookshelf
var Tag = models.Tag
var Episode = models.Episode
var EpisodeTag = models.EpisodeTag

getEpisodeJSONs().then(function(json){
    console.log(json);
    var outputPath = path.join(__dirname, 'simple_output.json')
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
