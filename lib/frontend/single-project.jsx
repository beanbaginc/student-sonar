// jshint ignore: start

import React from 'react';

import Project from './project';


export default class ProjectSingle extends React.Component {
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
        const { match, model } = this.props;
        const task = (
            model.get('projects')
                .chain()
                .map(section => section.get('tasks').get(match.params.taskId))
                .filter()
                .first()
                .value()
            || null);

        return task && (
            <div id="ideas" className="content-inner">
                <Project {...task.attributes}>{task.attributes.html}</Project>
            </div>
        );
    }
}
