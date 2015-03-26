/*
 * grunt-gabarito
 * https://github.com/pablo/grunt-gabarito
 *
 * Copyright (c) 2015 Pablo Cabrera
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    "use strict";

    var gabarito = require("gabarito");
    var path = require("path");
    var parts = require("parts");

    var defaults = {
        environments: ["node"],
        reporters: ["console"]
    };

    var pkg = grunt.file.readJSON("package.json")

    grunt.registerMultiTask("test", "gabarito test runner", function() {
        var done = this.async();
        var runner = new gabarito.runner.Runner();
        var cwd = process.cwd();

        this.files.forEach(function (f) {
            f.src.forEach(function (f) {
                runner.addFile(f.indexOf("/") === 0? f: path.join(cwd, f));
            });
        });

        var options = this.options(defaults);
        options.environments.map(function (env) {
            if (parts.isString(env)) {
                env = { type: env };
            }

            switch (env.type) {
            case "node"     : return new gabarito.runner.NodeEnvironment(
                    env.gabarito || gabarito);

            case "selenium" : return new gabarito.runner.SeleniumEnvironment(
                env.browser,
                env.hub || "http://localhost:4444/wd/hub");
            }
        }).forEach(function (env) { runner.addEnvironment(env); });

        options.reporters.map(function (r) {
            if (parts.isString(r)) {
                r = { type : r };
            }

            switch (r.type) {
            case "console"  : return new gabarito.runner.ConsoleReporter();
            case "junit"    : return new gabarito.runner.JUnitXmlReporter(
                    r.file || "results.xml",
                    r.name || pkg.name);
            }
        }).forEach(function (r) { runner.addReporter(r); });

        runner.run(function (results) {
            var hasErrors = results.some(function (r) {
                return r.results.some(function (r) {
                    return parts.some(r.results, function (r, i) {
                        return parts.hop(r, "error");
                    });
                });
            });

            done(!hasErrors);
        });

    });

};
