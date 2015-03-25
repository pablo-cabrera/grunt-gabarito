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

    grunt.registerMultiTask("test", "gabarito test runner", function() {
        var done = this.async();
//        var runner = new gabarito.runner.Runner();
//        var cwd = process.cwd();
//
//        this.files.forEach(function (f) {
//            f.src.forEach(function (f) {
//                if (f.indexOf("/") !== 0) {
//                    f = path.join(cwd, f);
//                }
//                runner.addFile(f);
//            });
//        });

        var options = this.options();

        console.log("yo", options);

        done(true);

//
//
//        runner.addEnvironment(new gabarito.runner.NodeEnvironment());
//        runner.addReporter(new gabarito.runner.ConsoleReporter());
//        runner.run(function (results) {
//            var hasErrors = results.some(function (r) {
//                return r.results.some(function (r) {
//                    return parts.some(r.results, function (r, i) {
//                        return parts.hop(r, "error");
//                    });
//                });
//            });
//
//            done(!hasErrors);
//        });
    });

};
