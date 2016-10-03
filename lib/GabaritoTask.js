"use strict";

var ilk = require("ilk");
var parts = require("parts");
var gabarito = require("gabarito");
var plumbing = gabarito.plumbing;

var GabaritoTask = ilk.tokens(function (
    runner,
    reportersRegistry,
    environmentsRegistry,

    registerTask,
    buildOptions,
    addFiles,
    addEnvironments,
    addReporters,
    dispatchRunner,
    resolveEnvironment,
    resolveReporter,
    sanitizeConfig
) {
    var DEFAULTS = {
        environments: ["node"],
        reporters: ["console"]
    };

    /**
     * The gabarito task responsible for reading grunt options and dispatching
     * the gabarito runner
     *
     * @class GabaritoTask
     * @constructor
     *
     * @param {gabarito::gabarito.plumbing.Runner} runner
     */
    return ilk(function (pRunner) {
        runner.mark(this, pRunner);
        reportersRegistry.mark(this, {});
        environmentsRegistry.mark(this, {});
    }).

    constant({

        /**
         * The singleton method for the GabaritoTask, used to register the task
         * itself and should be used to register environments and reporters.
         *
         * @method instance
         * @for GabaritoTask
         * @static
         *
         * @return {GabaritoTask}
         */
        instance: (function () {
            var singleton;

            return function () {
                if (singleton === undefined) {
                    singleton = new GabaritoTask(new plumbing.Runner());

                    singleton.registerEnvironment("node", function (env) {
                        return new plumbing.NodeEnvironment(
                            env.gabarito || gabarito);
                    });

                    singleton.registerEnvironment("phantom", function () {
                        return new plumbing.PhantomEnvironment();
                    });

                    singleton.registerReporter("console", function (reporter) {
                        return new plumbing.ConsoleReporter(reporter.stack);
                    });

                    singleton.registerReporter("junit",
                    function (reporter, grunt) {
                        return new plumbing.JUnitXmlReporter(
                            reporter.file || "results.xml",
                            reporter.name ||
                                    grunt.file.readJSON("package.json").name);
                    });

                }

                return singleton;
            };
        }())
    }).

    proto(addFiles, parts.that(function (that, files) {
        files.forEach(function (f) {
            f.src.forEach(function (f) {
                that[runner].addFile(f);
            });
        });
    })).

    proto(buildOptions, function (gruntThis, grunt) {
        var options = {};
        parts.merge(options, gruntThis.options(DEFAULTS));

        if (options.config) {
            parts.merge(options, grunt.file.readJSON(options.config));
        }

        return options;
    }).

    proto(sanitizeConfig, function (cfg) {
        return parts.isString(cfg)? { type: cfg }: cfg;
    }).

    proto(resolveEnvironment, function (env, grunt) {
        var cfg = this[sanitizeConfig](env);
        var type = cfg.type;

        if (type in this[environmentsRegistry]) {
            return this[environmentsRegistry][type](cfg, grunt);
        } else {
            throw new Error("Unknown environment: " + type);
        }
    }).

    proto(addEnvironments, parts.that(function (that, environments, grunt) {
        environments.forEach(function (env) {
            that[runner].addEnvironment(that[resolveEnvironment](env, grunt));
        });
    })).

    proto(resolveReporter, function (reporter, grunt) {
        var cfg = this[sanitizeConfig](reporter);
        var type = cfg.type;
        if (type in this[reportersRegistry]) {
            return this[reportersRegistry][type](cfg, grunt);
        } else {
            throw new Error("Unknown reporter: " + type);
        }
    }).

    proto(addReporters, parts.that(function (that, reporters, grunt) {
        reporters.forEach(function (reporter) {
            that[runner].addReporter(that[resolveReporter](reporter, grunt));
        });
    })).

    proto(dispatchRunner, function (done) {
        this[runner].run(function (results) {
            var hasErrors = results.some(function (r) {
                return r.results.some(function (r) {
                    return parts.some(r.results, function (r) {
                        return parts.hop(r, "error");
                    });
                });
            });

            done(!hasErrors);
        });
    }).

    proto(registerTask, parts.that(function (that, grunt) {
        grunt.registerMultiTask("test", "gabarito test runner", function () {
            var options = that[buildOptions](this, grunt);
            that[addFiles](this.files);
            that[addEnvironments](options.environments);
            that[addReporters](options.reporters);
            that[dispatchRunner](this.async());
        });
    })).

    proto({

        /**
         * Registers an environment factory within the GabaritoTask.
         *
         * The factory method will receive the configuration object and the
         * grunt reference.
         *
         * @method registerEnvironment
         * @for GabaritoTask
         *
         * @param {string} name
         * @param {function} factory
         */
        registerEnvironment: function (name, factory) {
            this[environmentsRegistry][name] = factory;
        },

        /**
         * Registers a reporter factory within the GabaritoTask.
         *
         * The factory method will receive the configuration object and the
         * grunt reference.
         *
         * @method registerReporter
         * @for GabaritoTask
         *
         * @param {string} name
         * @param {function} factory
         */
        registerReporter: function (name, factory) {
            this[reportersRegistry][name] = factory;
        },

        /**
         * Returns the grunt task function to be register within the
         * module.exports fashion
         *
         * @method task
         * @for GabaritoTask
         *
         * @return {function}
         */
        task: parts.that(function (that) {
            return function (grunt) {
                that[registerTask](grunt);
            };
        })
    });
});

module.exports = GabaritoTask;
