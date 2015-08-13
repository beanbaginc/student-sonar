import Backbone from 'backbone';


export default class RootView extends Backbone.View {
    constructor(options) {
        options.className = 'root content-inner';
        super(options);

        this._baseTemplate = `
            <div class="row">
                <div class="col-lg-8" id="content">
                    <div class="page-header">
                        <h1>Student Sonar</h1>
                    </div>
                </div>
            </div>
            `;

        this._loggedInTemplate = `
            <p>
                Sonar is a tool that we've put together to help keep track of
                students working on Review Board.
            </p>
            <p>
                On the left you'll see various components:

                <dl class="dl-horizontal">
                    <dt>Project Ideas</dt>
                    <dd>
                        A list of suggested projects that you can work on. If
                        you don't see anything you like, feel free to suggest
                        your own!
                    </dd>

                    <dt>Calendar</dt>
                    <dd>A list of important dates for your term</dd>

                    <dt>My Status Reports</dt>
                    <dd>
                        Here's where you'll go to submit your weekly status
                        report. Make sure to pay attention and get them in on
                        time.
                    </dd>
                </dl>
            </p>
            `;

        this._loggedOutTemplate = `
            <p>
                Sonar is a tool that we've put together to help keep track of
                students working on Review Board. To access most of the
                features of Sonar such as submitting your status reports,
                you'll need to log in.
            </p>
            <p>
                Login is done via Slack. If you haven't already accepted your
                invitation to Slack, you'll need to do that before you can log
                in here.
            </p>

            <div class="text-center">
                <a href="/login" class="btn btn-default btn-lg">
                    <img src="/images/slack-logo.png" width="24" height="24">
                    Login with Slack
                </a>
            </div>
            `;
    }

    render() {
        this.$el.html(this._baseTemplate);

        this.$('#content').html(
            this.model.get('loggedIn') ? this._loggedInTemplate
                                       : this._loggedOutTemplate);

        return this;
    }
}
