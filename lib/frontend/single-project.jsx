// jshint ignore: start

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { fetchProjects } from './redux/modules/projects';
import Project from './project';


class ProjectSingle extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchProjects());
    }

    render() {
        const { isFetching, task } = this.props;

        if (isFetching) {
            return (
                <div className="spinner">
                    <span className="fa fa-refresh fa-spin"></span>
                </div>
            );
        }

        return task && (
            <div id="ideas" className="content-inner">
                <Helmet>
                    <title>{task.name} - Student Sonar</title>
                </Helmet>
                <Project {...task}>{task.html}</Project>
            </div>
        );
    }
}


const mapStateToProps = (state, props) => {
    const { projects } = state;

    const task = Object.values(projects.items)
        .map(section => section.tasks.find(task => task.id == props.match.params.taskId))
        .reduce((accumulator, value) => value || accumulator, null);


    return {
        isFetching: projects.isFetching,
        task: task,
    };
};


export default connect(mapStateToProps)(ProjectSingle);
