// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';

import { fetchProjects } from './redux/modules/projects';
import Project from './project';


class ProjectSingle extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchProjects());
    }

    render() {
        const { isFetching, match, projects } = this.props;

        if (isFetching) {
            return (
                <div className="spinner">
                    <span className="fa fa-refresh fa-spin"></span>
                </div>
            );
        }

        const task = Object.values(projects)
            .map(section => section.tasks.find(task => task.id == match.params.taskId))
            .reduce((accumulator, value) => value || accumulator, null);

        return task && (
            <div id="ideas" className="content-inner">
                <Project {...task}>{task.html}</Project>
            </div>
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


export default connect(mapStateToProps)(ProjectSingle);
