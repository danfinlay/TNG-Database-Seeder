var fs = require('fs')
var path = require('path')

var models = require('./lib/models')
var knex = models.knex
var bookshelf = models.bookshelf
var Tag = models.Tag
var Episode = models.Episode
var EpisodeTag = models.EpisodeTag

getEpisodeJSONs().then(function(json){
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

        // WHERE WE FORMAT TAG JSON
        tags = tags.map(function(oldTag){
          oldTag.type = 'tag'
          oldTag.relationships = {
            episodes: {
              data: episodes.filter(function(ep){
                var found = false
                ep.tags.forEach(function(rel){
                  if (rel.type === 'tag' && rel.id === oldTag.id){
                    found = true
                  }
                })
                return found
              }).map(function(ep){
                return {
                  type: 'episode',
                  id: ep.id
                }
              })
            }
          }
          return oldTag
        })

        return {
          episodes: episodes,
          tags: tags
        }
      })
    })
  })
}

function joinTagList (episode) {
  return new EpisodeTag().where({
    episode_id: episode.id
  }).fetchAll().then(function(episodeTags){

    // WHERE WE FORMAT EPISODE JSON
    episode.type = 'episode'
    episode.tags = episodeTags.map(function(epTag){
      return {
        type: 'tag',
        id: epTag.attributes.tag_id
      }
    })
    return episode
  });
}
