// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';

import { fetchProjects } from './redux/modules/projects';
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


class ProjectList extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchProjects());
    }

    render() {
        if (this.props.isFetching) {
            return (
                <div className="spinner">
                    <span className="fa fa-refresh fa-spin"></span>
                </div>
            );
        }

        const sections = Object.entries(this.props.projects).map(item => {
            const [name, section] = item;

            return {
                id: section.id,
                name,
                tasks: section.tasks,
            };
        });

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


function mapStateToProps(state) {
    const { projects } = state;
    const { isFetching, items } = projects;

    return {
        isFetching,
        projects: items,
    };
}


export default connect(mapStateToProps)(ProjectList);
