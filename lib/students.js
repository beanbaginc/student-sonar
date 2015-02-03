var fs = require('fs'),
    Q = require('q');


module.exports = function(config) {
    var slack = require('./slack')(config);

    function loadStudents() {
        var deferred = Q.defer();
        fs.readFile('students.json', deferred.makeNodeResolver());

        return deferred.promise.then(JSON.parse);
    }

    function findByField(term, field, value) {
        var i, j, group, person;

        for (i = 0; i < term.groups.length; i++) {
            group = term.groups[i];

            for (j = 0; j < group.people.length; j++) {
                person = group.people[j];

                if (person[field] === value) {
                    return person;
                }
            }
        }
    }

    function getStudents() {
        return Q.all([loadStudents(), slack.getUsers()])
            .then(function(items) {
                var term = items[0],
                    slackUsers = items[1],
                    i,
                    user,
                    person;

                for (i = 0; i < slackUsers.members.length; i++) {
                    user = slackUsers.members[i];
                    person = findByField(term, 'slack_username', user.name);

                    if (person !== undefined) {
                        person.avatar = user.profile.image_192;
                    }
                }

                return term;
            });
    }

    return {
        findByField: findByField,
        getStudents: getStudents
    };
};