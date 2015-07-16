import Backbone from 'backbone';


/*
 * AdminView shows the admin UI.
 */
export default class AdminView extends Backbone.View {
    constructor(options) {
        super(options);

        this._rendered = false;
    }

    render() {
        if (!this._rendered) {
            this._rendered = true;
        }

        return this;
    }
}
