import _ from 'fetch';
import $ from 'jquery';
import moment from 'moment';

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

            if (student.slack_username) {
                $('<h2/>')
                    .text('Chat History')
                    .appendTo(details);

                let $history = $('<div/>')
                    .appendTo(details);

                this.updateChatHistory(student, $history);
            }

            if (student.rb_username) {
                $('<h2/>')
                    .text('Review Requests')
                    .appendTo(details);

                let $reviewRequests = $('<ul/>')
                    .attr('id', 'review-requests')
                    .appendTo(details);

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

                let heatmap = new CalHeatMap();
                heatmap.init({
                    data: data,
                    domain: 'month',
                    highlight: 'now',
                    itemSelector: $history[0],
                    start: start.toDate(),
                    subDomain: 'day',
                    weekStartOnMonday: false
                });
            });
    };

    proto.updateReviewRequests = function(student, $reviewRequests) {
        fetch('/review-requests/' + student.rb_username)
            .then(result => result.json())
            .then(function(result) {
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
                }
            });
    };

    proto.attributeChangedCallback = function(attribute, oldValue, newValue) {
        this.setAttribute(attribute, newValue);
    };

    window.XStudentViewElement = document.registerElement(tagName, {prototype: proto});
}
