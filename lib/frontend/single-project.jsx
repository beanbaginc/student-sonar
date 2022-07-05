// jshint ignore: start

import { graphql } from '@apollo/client/react/hoc';
import React from 'react';
import Helmet from 'react-helmet';

import { PROJECT_QUERY } from './api/project';
import Project from './project';


@graphql(PROJECT_QUERY, {
    options: props => ({
        variables: {
            project: props.match.params.taskId,
        },
    }),
})
export default class ProjectSingle extends React.Component {
    render() {
        const { data: { loading, error, project }} = this.props;

        if (loading) {
            return (
                <div className="spinner">
                    <span className="fas fa-sync fa-spin"></span>
                </div>
            );
        } else {
            return (
                <div id="ideas" className="content-inner">
                    <Helmet>
                        <title>{project.name} - Student Sonar</title>
                    </Helmet>
                    <Project {...project}>{project.html}</Project>
                </div>
            );
        }
    }
}
