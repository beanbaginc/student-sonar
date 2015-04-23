Student Sonar
=============

Getting set up
--------------
```
$ npm install
$ jspm install
```

You'll also need to create a `config.json` file that defines all the different
API keys and hostnames for things. Talk to David if you need some secrets.
```javascript
{
    "awsAccessKeyId": "",
    "awsRegion": "",
    "awsSecretAccessKey": "",
    "mongodbURI": "",
    "port": 8001,
    "reviewboardAPIToken": "",
    "reviewboardHost": "",
    "sessionSecret": "",
    "slackClientID": "",
    "slackClientSecret": "",
    "slackHost": "",
    "slackLogsTableName": "",
    "slackToken": ""
}
```

Finally, you'll need a MongoDB server. If you would like to run against the
public one, talk to David about it.

To run (for development):
```
$ npm start
```


TODO
----
* Extract custom element templates into their own files and use HTML imports.
* Switch to LESS?
* Show a spinner while loading async content.
