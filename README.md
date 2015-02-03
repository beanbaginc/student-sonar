Student Sonar
=============

Getting set up
--------------
```
$ npm install -g jspm
$ npm install -g nodemon
$ npm install
$ jspm install
```

You'll also need to create a `config.json` file that defines all the different
API keys and hostnames for things. Talk to David if you need some secrets.
```javascript
var config = {};

config.awsRegion = '';
config.awsAccessKeyId = '';
config.awsSecretAccessKey = '';

config.reviewboardAPIToken = '';
config.reviewboardHost = '';

config.slackLogsTableName = '';
config.slackHost = '';
config.slackToken = '';

module.exports = config;
```

Finally, you'll need a `students.json` file. Again, talk to David for this.

Running
-------
```
$ nodemon
```


TODO
----
* Use `History.pushState()` and some client-side routing to make the back
  button work
