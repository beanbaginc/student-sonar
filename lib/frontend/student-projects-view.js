import $ from 'jquery';
import _ from 'underscore';
import _fetch from 'fetch';
import Backbone from 'backbone';


export default class StudentProjectsView extends Backbone.View {
    constructor(options) {
        options.className = 'student-projects';
        super(options);

        this._sections = null;
        this._ready = this.model.get('ready');
        this._rendered = false;

        this._template = _.template(`
            <div class="row">
                <div class="col-lg-8 content-inner" id="ideas"></div>
                <nav class="col-lg-3" id="ideas-nav-container">
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

        this.listenTo(this.model, 'ready', this._onReady);
        this._updateProjects();
    }

    render() {
        this._rendered = true;

        if (this._sections && this._ready) {
            this.$el.html(this._template());

            const $nav = this.$('#ideas-nav');
            const $ideas = this.$('#ideas');

            this._sections.forEach(section => {
                let $section = $(this._sectionTemplate({
                    section: section
                }));

                let $navSection = $('<li/>')
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

                        if (task.assignee_email) {
                            user = this.model.get('users').find(
                                u => u.get('email') === task.assignee_email);
                        }

                        $section.append(this._taskTemplate({
                            task: task,
                            user: user
                        }));

                        let $li = $('<li/>')
                            .appendTo($ul);

                        $('<a/>')
                            .attr('href', `#task-${task.id}`)
                            .text(task.name)
                            .appendTo($li);
                    }
                });

                $section.appendTo($ideas);
            });

            this.$('#ideas-nav').find('a').click(function(ev) {
                const id = $(this).attr('href');
                const $target = $(id);
                const $main = $('.main');

                $main.scrollTop($target.offset().top - $main.offset().top);
                return false;
            });
        }

        return this;
    }

    _onReady() {
        this._ready = true;

        if (this._rendered) {
            this.render();
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
