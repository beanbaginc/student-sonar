import calendarHeatmap from 'cal-heatmap';
import _fetch from 'fetch';
import $ from 'jquery';
import moment from 'moment';

function createLinkList(links) {
    let $ul = $('<ul/>');

    for (let link of links) {
        let $a = $('<a/>')
            .text(link.text);

        if (link.href) {
            $a.attr('href', link.href);
        }

        if (link.color) {
            $a.css('color', link.color);
        }

        $('<li/>')
            .append($a)
            .appendTo($ul);
    }

    return $ul;
}


export default function() {
    let proto = Object.create(HTMLElement.prototype);
    let tagName = 'x-student-view';
    let cssAdded = false;

    proto.setAttribute = function(attribute, value) {
        if (attribute === 'student') {
            let student = JSON.parse(value);

            let avatar = this.shadowRoot.getElementById('avatar');
            let details = this.shadowRoot.getElementById('details');
            let email = this.shadowRoot.getElementById('email');
            let name = this.shadowRoot.getElementById('name');
            let school = this.shadowRoot.getElementById('school');

            name.textContent = student.name;

            if (student.school === undefined) {
                school.style.display = 'none';
            } else {
                school.textContent = student.school;
            }

            avatar.src = student.avatar;

            email.href = 'mailto:' + student.email;
            email.textContent = student.email;

            let createLinks = (title, links) =>
                $('<x-summary-entry/>')
                    .attr('title', title)
                    .append(createLinkList(links))
                    .appendTo(details);

            if (student.projects) {
                createLinks('Projects', student.projects);
            }

            if (student.demos) {
                createLinks('Demo Videos', student.demos);
            }

            if (student.status_reports) {
                createLinks('Status Reports', student.status_reports);
            }

            if (student.slack_username) {
                let $history = $('<div/>');
                this.updateChatHistory(student, $history);

                $('<x-summary-entry/>')
                    .attr('title', 'Chat History')
                    .append($history)
                    .appendTo(details);
            }

            let $reviewRequests;
            if (student.rb_username) {
                $reviewRequests = $('<ul/>');

                $('<x-summary-entry/>')
                    .attr('title', 'Review Requests')
                    .append($reviewRequests)
                    .appendTo(details);
            }

            $('<x-summary-entry/>')
                .attr('title', 'Timeline')
                .append('<x-event-list id="timeline" reversed />')
                .appendTo(details);

            if (student.rb_username) {
                this.updateReviewRequests(student, $reviewRequests);
            }
        }
    };

    proto.createdCallback = function() {
        let template = document.getElementById(tagName + '-template');
        let clone = document.importNode(template.content, true);

        if (Platform.ShadowCSS && !cssAdded) {
            let style = clone.querySelector('style');
            let cssText = Platform.ShadowCSS.shimCssText(style.textContent, tagName);
            Platform.ShadowCSS.addCssToDocument(cssText);
            cssAdded = true;
        }

        this.createShadowRoot().appendChild(clone);
    };

    proto.attachedCallback = function() {
        let attributes = Array.prototype.slice.call(this.attributes);
        attributes.forEach(attr => this.setAttribute(attr.name, attr.value));
    };

    proto.updateChatHistory = function(student, $history) {
        fetch('/slack-logs/' + student.slack_username)
            .then(result => result.json())
            .then(function(logs) {
                let data = {};

                for (let log of logs) {
                    let key = log.timestamp.toString();

                    if (data[key] === undefined) {
                        data[key] = 1;
                    } else {
                        data[key] += 1;
                    }
                }

                let start = moment().startOf('month').subtract(11, 'months');

                let heatmap = new calendarHeatmap();
                heatmap.init({
                    data: data,
                    displayLegend: false,
                    domain: 'month',
                    highlight: 'now',
                    itemSelector: $history[0],
                    start: start.toDate(),
                    subDomain: 'day',
                    tooltip: true,
                    weekStartOnMonday: false
                });
            });
    };

    proto.updateReviewRequests = function(student, $reviewRequests) {
        let timeline = this.shadowRoot.getElementById('timeline');

        fetch('/review-requests/' + student.rb_username)
            .then(result => result.json())
            .then(function(result) {
                let rb_logo = '<img src="images/reviewboard-logo.png" width="16" height="16" />';

                for (let rr of result.review_requests) {
                    if (!rr.public) {
                        continue;
                    }

                    let $li = $('<li/>')
                        .appendTo($reviewRequests);

                    let $a = $('<a/>')
                        .attr('href', rr.absolute_url)
                        .text(rr.summary)
                        .appendTo($li);

                    if (rr.status === 'submitted') {
                        $('<span>')
                            .css('color', 'green')
                            .text('[Submitted]')
                            .prependTo($a);
                    } else if (rr.status == 'discarded') {
                        $('<span>')
                            .css('color', 'red')
                            .text('[Discarded]')
                            .prependTo($a);
                    }

                    $('<li />')
                        .appendTo(timeline.getDay(rr.time_added))
                        .html(`<a href="${rr.absolute_url}">${rb_logo} ${rr.id}: ${rr.summary}</a>`);

                    for (let change of rr.changes) {
                        if (change.fields_changed.diff !== undefined) {
                            $('<li />')
                                .appendTo(timeline.getDay(change.timestamp))
                                .html(`<a href="${rr.absolute_url}">${rb_logo} ${rr.id}: ${rr.summary}</a>`)
                                .append(`<div class="details">${change.text}</div>`);
                        }
                    }
                }
            });
    };

    proto.attributeChangedCallback = function(attribute, oldValue, newValue) {
        this.setAttribute(attribute, newValue);
    };

    window.XStudentViewElement = document.registerElement(tagName, {prototype: proto});
}
