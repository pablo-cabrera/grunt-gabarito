"use strict";

var parts = require("parts");
var gabarito = require("gabarito");
var assert = gabarito.assert;
var matcher = gabarito.matcher;

var GabaritoTask = require("../../lib/GabaritoTask");

var task;
var runner;
var jsonPackage;
var env;
var reporter;

gabarito.test("GabaritoTask").

before(function () {
    env = {};
    reporter = {};
    jsonPackage = {};

    runner = {
        addFile: gabarito.spy(),
        addEnvironment: gabarito.spy(),
        addReporter: gabarito.spy(),
        run: gabarito.spy()
    };

    task = new GabaritoTask(runner);
    task.registerEnvironment("env", function () { return env; });
    task.registerReporter("reporter", function () { return reporter; });
}).

clause("task should return a function that register the task within grunt",
function () {
    assert.that(task.task()).isFunction();
}).

clause(
"the task should create a runner, build options, add files, add " +
"environments, add reporters, dispatch the runner and call the async callback",
function () {
    var done = gabarito.spy();
    var gruntThis = {
        files: [{ src: ["file"] }],
        options: gabarito.spy(function () {
            return {
                environments: ["env"],
                reporters: ["reporter"]
            };
        }),
        async: gabarito.spy(function ()  { return done; })
    };

    var grunt = { registerMultiTask: gabarito.spy() };

    var results = [{ results: [{ results: { testClause: {} } }] }];

    var taskGrabber = matcher.grabber();

    task.task()(grunt);

    grunt.registerMultiTask.
        verify().
        args("gabarito", "gabarito test runner", taskGrabber);

    taskGrabber.grab().call(gruntThis);

    gruntThis.options.
        verify().
        args(matcher.OBJECT);

    runner.addFile.verify().args(gruntThis.files[0].src[0]);
    runner.addFile.noCalls();

    runner.addEnvironment.verify().args(env);
    runner.addEnvironment.noCalls();

    runner.addReporter.verify().args(reporter);
    runner.addReporter.noCalls();

    var runCallbackGrabber = matcher.grabber();
    runner.run.verify().args(runCallbackGrabber);

    var runCallback = runCallbackGrabber.grab();

    runCallback(results);
    done.verify().args(true);
}).

clause(
"buildOptions should merge the required json if the config option is used",
function () {

    var myEnvs = ["env"];

    var grunt = {
        registerMultiTask: gabarito.spy(),
        file: {
            readJSON: gabarito.spy(function () {
                return { environments: myEnvs };
            })
        }
    };

    var gruntThis = {
        files: [],
        options: gabarito.spy(function () {
            return {
                environments: [],
                reporters: [],
                config: "options.json"
            };
        }),
        async: gabarito.spy(function ()  { return parts.k; })
    };

    var taskGrabber = matcher.grabber();

    task.task()(grunt);

    grunt.registerMultiTask.
        verify().
        args(matcher.ANY, matcher.ANY, taskGrabber);

    taskGrabber.grab().call(gruntThis);

    grunt.file.readJSON.verify().
        args("options.json");

    runner.addEnvironment.verify().
        args(env);

});
