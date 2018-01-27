// jshint ignore: start

import React from 'react';
import ReactDOM from 'react-dom';

import ReadyView from './ready-view';
import Project from './project';
import ScrollSpy from './scrollspy';


const NavSection = ({ id, name, tasks, onClick }) => (
    <li className="item" key={id}>
        <a href={`#section-${id}`} onClick={onClick}>{name}</a>
        <ul className="nav">
            {tasks.map(task => (
                <li className="sub-item" key={task.id}>
                    <a href={`#task-${task.id}`}>{task.name}</a>
                </li>
            ))}
        </ul>
    </li>
);


const ProjectSection = ({ id, name, tasks }) => (
    <section id={`section-${id}`} key={id}>
        <div className="page-header">
            <h2>{name}</h2>
        </div>
        {tasks.map(task => (
            <Project key={task.id} {...task}>{task.html}</Project>
        ))}
    </section>
);


export default class StudentProjectsListView extends ReadyView {
    constructor(options) {
        options = Object.create(options);
        options.className = 'student-projects';
        super(options);

        this.model.get('projects').fetch().then(() => this.render());
    }

    _render() {
        const sections = this.model.get('projects').map(section => ({
            id: section.get('id'),
            name: section.get('name'),
            tasks: section.get('tasks')
                .filter(task => !task.get('completed'))
                .map(task => ({
                    assignee: task.get('assignee_email'),
                    html: task.get('html'),
                    id: task.get('id'),
                    name: task.get('name'),
                    projects: task.get('projects'),
                    tags: task.get('tags'),
                })),
        }));

        ReactDOM.render(
            <ScrollSpy
                className="row"
                content="#ideas-container"
                nav="#ideas-nav">
                <div className="col-lg-8" id="ideas-container">
                    <div className="content-inner" id="ideas">
                        {sections.map(section =>
                            <ProjectSection key={section.id} {...section} />
                        )}
                    </div>
                </div>
                <nav className="col-lg-4" id="ideas-nav-container">
                    <ul className="nav" id="ideas-nav">
                        {sections.map(section =>
                            <NavSection key={section.id} {...section} />
                        )}
                    </ul>
                </nav>
            </ScrollSpy>,
            this.$el[0]);
    }
}
