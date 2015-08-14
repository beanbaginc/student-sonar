import $ from 'jquery';
import _ from 'underscore';
import _fetch from 'fetch';
import Backbone from 'backbone';

import ReadyView from './ready-view';


export default class StudentProjectsView extends ReadyView {
    constructor(options) {
        options.className = 'student-projects';
        super(options);

        _.bindAll(this, '_updateNavScroll');

        this._sections = null;

        this._template = _.template(`
            <div class="row">
                <div class="col-lg-8" id="ideas-container">
                    <div class="content-inner" id="ideas"></div>
                </div>
                <nav class="col-lg-4" id="ideas-nav-container">
                    <ul class="nav" id="ideas-nav"></ul>
                </div>
            </div>
            `);

        this._sectionTemplate = _.template(`
            <section id="section-<%- section.id %>">
                <div class="page-header">
                    <h2><%- section.name %></h2>
                </div>
            </section>
            `);

        this._taskTemplate = _.template(`
            <section id="task-<%- task.id %>">
                <h3>
                    <%- task.name %>
                    <% if (user) { %>
                        <img src="<%- user.get('avatar') %>" class="assignee img-rounded">
                    <% } %>
                </h3>

                <% if (task.tags || task.projects) { %>
                    <div class="tags">
                        <% task.projects.forEach(function(projectName) { %>
                            <% if (projectName !== 'Student Projects') { %>
                                <span class="label label-primary"><%- projectName %></span>
                            <% } %>
                        <% }) %>

                        <% task.tags.forEach(function(tag) { %>
                            <span class="label label-default"><%- tag %></span>
                        <% }) %>
                    </div>
                <% } %>

                <%= task.html %>
            </section>
            `);

        this._updateProjects();
    }

    _render() {
        if (this._sections) {
            this.$el.html(this._template());

            const $navContainer = this.$('#ideas-nav-container');
            const $nav = this.$('#ideas-nav');
            const $ideas = this.$('#ideas');
            const loggedIn = this.model.get('loggedIn');
            const $ideasContainer = this.$('#ideas-container')
                .scrollspy({ target: '#ideas-nav' });

            this._sections.forEach(section => {
                let $section = $(this._sectionTemplate({
                    section: section
                }));

                let $navSection = $('<li class="item" />')
                    .appendTo($nav);

                $('<a/>')
                    .attr('href', `#section-${section.id}`)
                    .text(section.name)
                    .appendTo($navSection);

                let $ul = $('<ul class="nav">')
                    .appendTo($navSection);

                section.tasks.forEach(task => {
                    if (!task.completed) {
                        let user = null;

                        if (task.assignee_email && loggedIn) {
                            user = this.model.get('users').find(
                                u => u.get('email') === task.assignee_email);
                        }

                        $section.append(this._taskTemplate({
                            task: task,
                            user: user
                        }));

                        let $li = $('<li class="sub-item" />')
                            .appendTo($ul);

                        $('<a/>')
                            .attr('href', `#task-${task.id}`)
                            .text(task.name)
                            .appendTo($li);
                    }
                });

                $section.appendTo($ideas);
            });


            $nav.find('a')
                .click(function() {
                    const id = $(this).attr('href');
                    const $target = $(id);

                    $ideasContainer
                        .scrollTop($target.offset().top - $ideas.offset().top)
                        .scrollspy('process');
                    return false;
                });

            $nav.find('li').on('activate.bs.scrollspy',
                               _.debounce(this._updateNavScroll, 50));
        }
    }

    _updateNavScroll() {
        let $li = this.$('li.active.sub-item');

        if ($li.length === 0) {
            return;
        }

        // If the selected item is the first in its section, actually scroll to
        // the parent label.
        if ($li.is(':first-child')) {
            $li = this.$('li.active.item');
        }

        const $nav = this.$('#ideas-nav');
        const $navContainer = this.$('#ideas-nav-container');
        const liOffset = $li.offset().top - $nav.offset().top;
        const navHeight = $navContainer.innerHeight();
        const navTop = $navContainer.scrollTop();
        const liHeight = $li.children('a').innerHeight();

        if (liOffset - navTop < 0) {
            $navContainer.scrollTop(liOffset);
        } else if (liOffset -navTop > navHeight - liHeight) {
            $navContainer.scrollTop(liOffset + liHeight - navHeight);
        }
    }

    _updateProjects() {
        fetch('/api/student-projects')
            .then(result => result.json())
            .then(rsp => {
                this._sections = [];

                for (let name in rsp) {
                    if (rsp.hasOwnProperty(name)) {
                        this._sections.push({
                            name: name,
                            id: rsp[name].id,
                            tasks: rsp[name].tasks
                        });
                    }
                }

                this.render();
            });
    }
}
