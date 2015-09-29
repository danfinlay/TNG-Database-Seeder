var request = require('request')
var cheerio = require('cheerio')

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

var episodeList = require('./episode_list_2.json')
var episode_iterator = 0

getNextEpisode()

function getNextEpisode() {
  if (episode_iterator = episodeList.length) {
    console.log("All done!");
    return knex.destroy();
  }

  setTimeout(function(){
    var episode = episodeList[episode_iterator++]
    getEpisodeIfNotYetLoaded(episode)
  }, 500);
}

// Checks DB or requests from wikipedia
function getEpisodeIfNotYetLoaded(episode) {
  if (!episode) return getNextEpisode()
  console.log(`Fetching episode ${episode.title}`)
  new Episode().where(episode).fetch()
  .then(function(data){
    if (data) {
      console.log(`Already created episode ${episode.title}`)
      getNextEpisode()
      return data;
    } else {
      console.log('Creating record + tags')
      return new Episode(episode).save()
      .then(function(data){
        getEpisodeTags(data);
      })
    }
  })
  .catch(function(err){
    throw err
  })
}

function getEpisodeTags(episode){
  if (!episode || !episode.attributes.url) return getNextEpisode()
  request('http://en.memory-alpha.wikia.com'+episode.attributes.url, function (err, res, body) {
    if (err) throw err
    console.log("Episode HTML returned");

    var tags = parseTags(body)
    var promises = tags.filter(function(tag){
      return !!tag;
    }).map(createTag)
    Promise.all(promises)
    .then(function(results){
      console.log('Tags created, creating joins')
      return createEpisodeTags(episode, results)
      .then(function(episodeTags){
        console.log("Joins created, getting next episode")
        getNextEpisode()
      })
      .catch(function(err){
        if (err) {
          console.log(`creating tags threw err: ${JSON.stringify(err)}`)
        }
        throw err;
      })
    })
  })
}

function createTag(tag){
  var returned = false;
  console.log(tag.title)
  return new Tag().where({
    url: tag.url
  }).fetch()
  .then(function(data){
    returned = true;
    if (!data) {
      console.log(`creating new tag ${tag.title}`)
      return new Tag(tag).save()
    } else {
      console.log(`tag ${tag.title} already existed`)
      return data
    }
  })
  .catch(function(err){
    console.log(`${tag.title} threw error: ${JSON.stringify(err)}`)
    console.dir(err)
    throw err
  })
  .finally(function(){
    if (!returned) {
      return new Tag(tag).save()
    }
  })
}

function createEpisodeTags(episode, tags){
  console.log(`creating EP-TAGS for ${episode.attributes.title}`)
  var promises = tags.map(function(tag){
    return new EpisodeTag({
      episode_id: episode.attributes.id,
      tag_id: tag.attributes.id,
    }).save();
  })
  return Promise.all(promises)
}

function parseTags(body) {
  var $ = cheerio.load(body)
  var $els = $('h3:has(#References) + p a')
  var rows = []
  for(var i = 0; i < $els.length; i++) { rows.push($els[i]); }
  var tags = rows.map(function(row){ return { title: $(row).text(), url: $(row).attr('href') }; });
  return tags
}
