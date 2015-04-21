import _ from 'fetch';
import $ from 'jquery';
import moment from 'moment';
import components from './components';

components();

fetch('/students')
    .then(result => result.json())
    .then(function(groups) {
        let $groups = $('<div/>')
            .addClass('groups')
            .appendTo(document.body);

        function openStudentView(data) {
            $('<x-student-view/>')
                .attr('student', data)
                .appendTo(document.body);
        }

        function onCardClick(data, student, ev) {
            openStudentView(data);
            history.pushState(null, null, '?student=' + student.slack_username);
        }

        window.addEventListener('popstate', function() {
            $('x-student-view').remove();
        });

        let query = document.location.search.substr(1).split('&');
        let queryStudent = null;
        for (let queryVar of query) {
            let q = queryVar.split('=');
            if (q[0] === 'student') {
                queryStudent = q[1];
            }
        }

        for (let group of groups) {
            let $group = $('<div/>')
                .addClass('group')
                .appendTo($groups);

            $('<h2/>')
                .text(group.name)
                .appendTo($group);

            let $students = $('<div/>')
                .addClass('students')
                .appendTo($group);

            for (let person of group.people) {
                let data = JSON.stringify(person);

                let $card = $('<x-student-card/>')
                    .addClass('student')
                    .attr('student', data)
                    .on('click', onCardClick.bind(this, data, person))
                    .appendTo($students);

                if (person.slack_username === queryStudent) {
                    openStudentView(data);
                }
            }
        }
    });

export default {};
