let fetch = require('node-fetch'),
    Q = require('q'),
    schema = require('./schema');

module.exports = function() {
    function getGroup(group) {
        let deferred = Q.defer();

        schema.User.find({ groups: group.key }, deferred.makeNodeResolver());

        return deferred.promise.then(function(users) {
            users.sort((a, b) => a.name < b.name ? -1 : 1);

            return {
                name: group.name,
                people: users
            };
        });
    }

    function getStudents() {
        let groups = [
            { name: 'UCOSP Spring 2015', key: 'ucosp-2015.1' },
            { name: 'Open Academy Spring 2015', key: 'oa-2015.1' }
        ];

        return Q.all(groups.map(getGroup));
    }

    return {
        getStudents: getStudents
    };
};
