// jshint ignore: start

import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';

import { PROJECTS_QUERY } from './api/project';
import Project from './project';
import ScrollSpy from './scrollspy';


const NavSection = ({ id, name, tasks }) => (
    <li className="item">
        <a href={`#section-${id}`}>{name}</a>
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
    <section id={`section-${id}`}>
        <div className="page-header">
            <h2>{name}</h2>
        </div>
        {tasks.map(task => (
            <Project key={task.id} {...task}>{task.html}</Project>
        ))}
    </section>
);


@graphql(PROJECTS_QUERY)
export default class ProjectList extends React.Component {
    render() {
        const { data: { loading, error, projects }} = this.props;

        if (loading) {
            return (
                <div className="spinner">
                    <span className="fas fa-sync fa-spin"></span>
                </div>
            );
        }

        const sections = new Map();
        projects.forEach(project => {
            if (project.completed) {
                return;
            }

            if (sections.has(project.section)) {
                sections.get(project.section).push(project);
            } else {
                sections.set(project.section, [project]);
            }
        });

        const entries = Array.from(sections.entries());

        return (
            <React.Fragment>
                <Helmet>
                    <title>Project Ideas - Student Sonar</title>
                </Helmet>
                <ScrollSpy
                    className="project-list"
                    content="#ideas-container"
                    nav="#ideas-nav">
                    <div className="content-inner" id="ideas-container">
                        <div id="ideas">
                            {entries.map(([section, tasks]) =>
                                <ProjectSection key={section} name={section} tasks={tasks} />
                            )}
                        </div>
                    </div>
                    <nav id="ideas-nav-container">
                        <ul className="nav" id="ideas-nav">
                            {entries.map(([section, tasks]) =>
                                <NavSection key={section} name={section} tasks={tasks} />
                            )}
                        </ul>
                    </nav>
                </ScrollSpy>
            </React.Fragment>
        );
    }
}
