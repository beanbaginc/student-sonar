import _ from 'fetch';
import $ from 'jquery';
import moment from 'moment';
import components from './components';

components();

fetch('/students')
    .then(result => result.json())
    .then(function(term) {
        $('<h1/>')
            .text(term.term)
            .appendTo(document.body);

        let $groups = $('<div/>')
            .addClass('groups')
            .appendTo(document.body);

        function onCardClick(data, student, ev) {
            $('<x-student-view/>')
                .attr('student', data)
                .appendTo(document.body);
            history.pushState(null, null, '?student=' + student.slack_username);
        }

        window.addEventListener('popstate', function() {
            $('x-student-view').remove();
        });

        for (let group of term.groups) {
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

                $('<x-student-card/>')
                    .addClass('student')
                    .attr('student', data)
                    .on('click', onCardClick.bind(this, data, person))
                    .appendTo($students);
            }
        }
    });

export default {};
