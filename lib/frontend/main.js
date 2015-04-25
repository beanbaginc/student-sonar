import _ from 'fetch';
import $ from 'jquery';
import moment from 'moment';
import components from './components';

components();

let $content = $('<div/>')
    .addClass('content')
    .appendTo(document.body);

let $studentList = $('<div/>')
    .appendTo($content);

fetch('/calendar')
    .then(result => result.json())
    .then(function(calendar) {
        let $calendar = $('<div/>')
            .addClass('calendar');

        $('<h1>')
            .text('Calendar')
            .appendTo($calendar);

        let $ul = $('<ul/>')
            .appendTo($calendar);

        calendar.map(item => { item.date = moment(item.date); return item; });
        calendar.sort((a, b) => a.date - b.date);

        let currentDate = null;

        for (let item of calendar) {
            let groupIntersection = item.show_to_groups.filter(
                group => window.user.groups.indexOf(group) !== -1);

            if (window.isAdmin ||
                item.show_to_groups.indexOf('*') !== -1 ||
                groupIntersection.length > 0) {

                let $li = $('<li/>')
                    .appendTo($ul);

                let date = item.date.format('ddd, MMM D');

                if (date !== currentDate) {
                    $('<div/>')
                        .addClass('date')
                        .text(date)
                        .appendTo($li);
                    currentDate = date;
                }

                $('<div/>')
                    .text(item.summary)
                    .appendTo($li);
            }
        }

        if ($ul.children().length) {
            $calendar.appendTo($studentList);
        }
    });

fetch('/students')
    .then(result => result.json())
    .then(function(groups) {
        let $groups = $('<div/>')
            .addClass('groups')
            .appendTo($studentList);

        function openStudentView(data) {
            $('<x-student-view/>')
                .attr('student', data)
                .appendTo($content);
            $studentList.hide();
        }

        function onCardClick(data, student, ev) {
            openStudentView(data);
            history.pushState(null, null, '?student=' + student.slack_username);
        }

        window.addEventListener('popstate', function() {
            $studentList.show();
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
