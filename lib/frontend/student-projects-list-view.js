import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import ReadyView from './ready-view';
import TaskView from './task-view';


export default class StudentProjectsListView extends ReadyView {
    constructor(options) {
        options = Object.create(options);
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
            <section id="section-<%- id %>">
                <div class="page-header">
                    <h2><%- name %></h2>
                </div>
            </section>
            `);

        this.model.get('projects').fetch().then(() => this.render());
    }

    _render() {
        const projects = this.model.get('projects');

        this.$el.html(this._template);

        const loggedIn = this.model.get('loggedIn');
        const $navContainer = this.$('#ideas-nav-container');
        const $nav = this.$('#ideas-nav');
        const $ideas = this.$('#ideas');
        const $ideasContainer = this.$('#ideas-container')
            .scrollspy({ target: '#ideas-nav' });

        projects.each(section => {
            const $section = $(this._sectionTemplate(section.attributes));
            const $navSection = $('<li class="item" />')
                .appendTo($nav);

            $('<a/>')
                .attr('href', `#section-${section.get('id')}`)
                .text(section.get('name'))
                .appendTo($navSection);

            const $ul = $('<ul class="nav">')
                .appendTo($navSection);

            section.get('tasks').each(task => {
                if (!task.get('completed')) {
                    const taskView = new TaskView({model: task});
                    $section.append(taskView.render().el);

                    const $li = $('<li class="sub-item" />')
                        .appendTo($ul);

                    $('<a/>')
                        .attr('href', `#task-${task.get('id')}`)
                        .text(task.get('name'))
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
}
