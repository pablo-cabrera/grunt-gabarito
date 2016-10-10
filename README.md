grunt-gabarito [![Build Status](https://travis-ci.org/pablo-cabrera/grunt-gabarito.png)](https://travis-ci.org/pablo-cabrera/gabarito-grunt)
==============

> Run gabarito test runner within grunt



## TL;DR

Install dev dependencies.

```shell
npm install gabarito --save-dev
npm install grunt-gabarito --save-dev
```
Configure within `Gruntfile.js`

```js
grunt.initConfig({
    gabarito: {
        src: ["test.js"]
    }
});

grunt.loadNpmTasks("grunt-gabarito");
```

Write test.
```js
// test.js

var gabarito = require("gabarito");
var assert = gabarito.assert;

gabarito.add("test").
clause("should pass", function () {
    assert.isTrue(true);
}).

clause("should fail", function () {
    assert.isTrue(false);
});
```
Run.
```shell
grunt gabarito
```

### Options

#### src
Type: `String|Array`

Test files. These files will be passed to the selected gabarito environment(s).

#### options.environments
Type: `Array` default: `["node"]`

Your gabarito environments. Gabarito will issue the test files for each of the selected environments.
This plugin comes bundled with "node" and "phantom" environments. For aditional configurations to be passed to the environment, the object format may be used.

E.g.:
```js
grunt.initConfig({
    gabarito: {
        src: "test.js",
        environments: [
            "phantom",
            {
                type: "node",
                stack: "true"
            }
        ]
    }
});
```

#### options.reporters
Type: `Array` default: `["console"]`

Gabarito reporters. Gabarito will tell the reporters what is going on with the tests themselves. This plugin comes bundled with "console" and "junit" reporters. For aditional configurations to be passed to the reporter, the object format may be used.

E.g.:
```js
grunt.initConfig({
    gabarito: {
        src: "test.js",
        reporters: [
            "console",
            {
                type: "junit",
                file: "junit-results.xml",
                name: "Project X"
            }
        ]
    }
});
```

#### options.config
Type: `String`

JSON file to be used as configuration.
