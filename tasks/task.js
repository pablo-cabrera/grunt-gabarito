/*
 * grunt-gabarito https://github.com/pablo/grunt-gabarito
 *
 * Copyright (c) 2015 Pablo Cabrera Licensed under the MIT license.
 */

module.exports = function(grunt) {
    "use strict";

    var gabarito = require("gabarito");
    var path = require("path");
    var parts = require("parts");
    var plumbing = gabarito.plumbing;

    var defaults = {
        environments: ["node"],
        reporters: ["console"]
    };

    var pkg = grunt.file.readJSON("package.json")

    var getCapabilities = function (env) {
        var capabilities = {
            browserName: env.browserName
        };

        if (env.platform) {
            capabilities.platform = env.platform
        }

        if (env.version) {
            capabilities.version = env.version;
        }

        return capabilities;
    };

    var getHostIpAddress = function () {
        var os = require('os');
        var ifaces = os.networkInterfaces();
        var ips = [];

        parts.forEach(ifaces, function (v) {
            v.forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal) {
                    return;
                }
                ips.push(iface.address);
            });
        });

        return ips[0] || "localhost";
    };

    grunt.registerMultiTask("test", "gabarito test runner", function() {
        var done = this.async();
        var runner = new plumbing.Runner();
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
            case "node"             : return new plumbing.NodeEnvironment(
                    env.gabarito || gabarito);

            case "selenium"         : return new plumbing.SeleniumEnvironment(
                getCapabilities(env),
                env.hub || "localhost:4444",
                env.host || getHostIpAddress());

            case "vbox-selenium"    : return new plumbing.VBoxSeleniumEnvironment(
                getCapabilities(env),
                env.hub || "localhost:4444",
                env.host || getHostIpAddress(),
                env.vm,
                env.vmAddress);
            }

        }).forEach(function (env) { runner.addEnvironment(env); });

        options.reporters.map(function (r) {
            if (parts.isString(r)) {
                r = { type : r };
            }

            switch (r.type) {
            case "console"  : return new plumbing.ConsoleReporter();
            case "junit"    : return new plumbing.JUnitXmlReporter(
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
