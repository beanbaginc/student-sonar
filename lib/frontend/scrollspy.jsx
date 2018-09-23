// jshint ignore: start

import React from 'react';


function debounce(func, wait) {
    let timeout;

    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    }
}


export default class ScrollSpy extends React.Component {
    constructor(props) {
        super(props);

        this._onActiveChanged = this._onActiveChanged.bind(this);
        this._onNavClicked = this._onNavClicked.bind(this);
    }

    componentDidMount() {
        this._$content = this._$el.find(this.props.content);
        this._$nav = this._$el.find(this.props.nav);
        this._$navContainer = this._$nav.parent();

        this._$content.scrollspy({ target: this.props.nav });
        this._$nav.on({
            'activate.bs.scrollspy': debounce(this._onActiveChanged, 50),
            'click': this._onNavClicked,
        });
    }

    componentWillUnmount() {
        this._$content
            .off('scroll.bs.scrollspy')
            .removeData('bs.scrollspy');

        this._$nav.find('.active')
            .removeClass('active');

        this._$content = null;
        this._$nav = null;
        this._$navContainer = null;
    }

    render() {
        return (
            <div
                className={this.props.className}
                ref={(el) => this._$el = el ? $(el) : null}>
                {this.props.children}
            </div>
        );
    }

    _onActiveChanged() {
        let $li = this._$el.find('li.active.sub-item');

        if ($li.length === 0) {
            return;
        }

        // If the selected item is the first in its section, actually scroll to
        // the parent label.
        if ($li.is(':first-child')) {
            $li = $li.parents('li.active.item');
        }

        const navHeight = this._$navContainer.innerHeight();
        const navTop = this._$navContainer.scrollTop();
        const liOffset = $li.offset().top - this._$nav.offset().top;
        const liHeight = $li.children('a').innerHeight();

        if (liOffset - navTop < 0) {
            this._$navContainer.scrollTop(liOffset);
        } else if (liOffset - navTop > navHeight - liHeight) {
            this._$navContainer.scrollTop(liOffset + liHeight - navHeight);
        }
    }

    _onNavClicked(e) {
        e.preventDefault();
        e.stopPropagation();

        const id = e.target.getAttribute('href');
        const $target = this._$content.find(id);
        const $inner = this._$content.children();

        this._$content.scrollTop($target.offset().top - $inner.offset().top);
    }
}
