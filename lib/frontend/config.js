System.config({
  "paths": {
    "*": "*.js",
    "rb-student-dashboard/*": "lib/*.js",
    "github:*": "../../jspm_packages/github/*.js",
    "npm:*": "../../jspm_packages/npm/*.js",
    "student-sonar/*": "lib/*.js"
  }
});

System.config({
  "map": {
    "backbone": "npm:backbone@1.2.1",
    "cal-heatmap": "npm:cal-heatmap@3.5.2",
    "d3": "github:mbostock/d3@3.5.5",
    "fetch": "npm:whatwg-fetch@0.7.0",
    "jquery": "github:components/jquery@2.1.3",
    "less": "github:aaike/jspm-less-plugin@0.0.5",
    "moment": "github:moment/moment@2.9.0",
    "underscore": "npm:underscore@1.8.3",
    "webcomponents": "npm:webcomponents.js@0.5.3",
    "github:aaike/jspm-less-plugin@0.0.5": {
      "less.js": "github:distros/less@2.4.0"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "npm:backbone@1.2.1": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "underscore": "npm:underscore@1.8.3"
    },
    "npm:cal-heatmap@3.5.2": {
      "d3": "npm:d3@3.5.5"
    },
    "npm:webcomponents.js@0.5.3": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

