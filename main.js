let Twit = require('twit');
let fs = require('fs');
let moment = require('moment');
let _ = require('lodash');

var T = new Twit({
  consumer_key: 'CzriYfPsn1NeZjnfVHp8ZQSl1',
  consumer_secret: 'A5lYgc0j90lqJKA2soNLR6X3g8ZBAYm1O32pG8LusO4IkREO76',
  app_only_auth: true
});

let users = {};

let getTweetsByDay = function(screen_name) {
  T.get('statuses/user_timeline', { screen_name: screen_name })
}

let finishedGettingUserList = function(result) {
  let users = result.data.users;
  let userTweets = [];
  let twitPromises = [];
  users.forEach(user => {
    twitPromises.push(T.get('statuses/user_timeline', { screen_name: user.screen_name, count: 200 }));
  });
  return Promise.all(twitPromises)
    .then(function(timelineData) {
      timelineData.forEach(timeline => {
        let timelineData = timeline.data;
        let screen_name = timelineData[0].user.screen_name;
        let tweets = [];
        timelineData.forEach(tweet => tweets.push({
          'date': tweet.created_at,
          'text': tweet.text
        }));
        userTweets.push({
          'screen_name': screen_name,
          'tweets': tweets
        });
      });
      return userTweets;
    });
}

let processTweetsByDate = function(userTweets) {
  let daysAgo = _.range(0, 30);
  let userTweetsByDay = [];
  return userTweets.map(function(user) {
    let tweets = user.tweets;
    let tweetsByDay = daysAgo.map(function(numberOfDaysAgo) {
      let targetDay = moment().subtract(numberOfDaysAgo, 'days');
      let tweetsOnDay = _.filter(tweets, tweet => {
        return moment().utc(tweet.date).isSame(targetDay, 'day')
      })
      .map(tweet => tweet.text)
      return {
        'day': targetDay.toISOString(),
        'count': tweetsOnDay.length 
      }
    });
    return {
      'screen_name': user.screen_name,
      'tweets_by_day': tweetsByDay,
    }
  });
}

let process2 = function(userArr) {
  let daysAgo = _.range(0, 30);
  return userArr.map(user => {
    let userName = user.screen_name;
    let userTweetsByDate = daysAgo.map(function(numberOfDaysAgo) {
      let targetDay = moment().subtract(numberOfDaysAgo, 'days');
      let tweetsOnDay = _.filter(user.tweets, tweet => {
        return moment.utc(tweet.date).local().isSame(targetDay, 'day')
      });
      return {
        'day': numberOfDaysAgo,
        'count': tweetsOnDay.length
      }
    });
    return {
      'user': userName,
      'tweetsByDay': userTweetsByDate
    }
  });
}

// for getting fresh data

// T.get('friends/list', { screen_name: 'nytimes' })
//   .then(finishedGettingUserList)
//   // .then(data => fs.writeFile('output.json', JSON.stringify(data, null, 2)));
//   .then(process2)
//   .then(data => fs.writeFile('output2.json', JSON.stringify(data, null, 2)));


// for using cached data

fs.readFile('output.json', (err, data) => {
  if (err) {
    console.log(err);
  } else {
    fs.writeFile('output2.json', JSON.stringify(process2(JSON.parse(data))));
  }
});