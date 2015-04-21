var fetch = require('node-fetch'),
    fs = require('fs'),
    Q = require('q'),
    schema = require('./schema');

module.exports = function() {
    function getGroup(group) {
        var deferred = Q.defer();

        schema.User.find({ groups: group.key }, deferred.makeNodeResolver());

        return deferred.promise.then(function(users) {
            users.sort(function(a, b) {
                return a.name < b.name ? -1 : 1;
            });

            return {
                name: group.name,
                people: users
            };
        });
    }

    function getStudents() {
        var groups = [
            { name: 'UCOSP Spring 2015', key: 'ucosp-2015.1' },
            { name: 'Open Academy Spring 2015', key: 'oa-2015.1' }
        ];

        return Q.all(groups.map(getGroup));
    }

    return {
        getStudents: getStudents
    };
};
