// jshint ignore: start

import React from 'react';

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


export default class ProjectList extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.model.on('ready', this.handleChange);
        this.props.model.get('projects').fetch().then(this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('ready', this.handleChange);
    }

    handleChange() {
        this.forceUpdate();
    }

    render() {
        const sections = this.props.model.get('projects').map(section => ({
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

        return (
            <ScrollSpy
                className="project-list"
                content="#ideas-container"
                nav="#ideas-nav">
                <div className="content-inner" id="ideas-container">
                    <div id="ideas">
                        {sections.map(section =>
                            <ProjectSection key={section.id} {...section} />
                        )}
                    </div>
                </div>
                <nav id="ideas-nav-container">
                    <ul className="nav" id="ideas-nav">
                        {sections.map(section =>
                            <NavSection key={section.id} {...section} />
                        )}
                    </ul>
                </nav>
            </ScrollSpy>
        );
    }
}
