module.exports = function (grunt) {
    "use strict";

    var lintFiles = [
        "Gruntfile.js",
        "tasks/test.js",
        "lib/**/*.js",
        "test/cases/**/*.js"
    ];

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        jscs: {
            src: lintFiles,

            options: {
                config: ".jscsrc"
            }
        },

        jshint: {
            options: {
                /* enforcing */
                strict: true,
                bitwise: false,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                plusplus: true,
                quotmark: "double",

                undef: true,

                /* relaxing */
                eqnull: true,
                sub: true,

                /* environment */
                node: true,
                browser: true,
                globals: {
                    JSON: true
                }
            },

            files: lintFiles
        },

        test: {
            src: "test/cases/**/*.js"
        },

        yuidoc: {
            compile: {
                name: "<%= pkg.name %>",
                description: "<%= pkg.description %>",
                version: "<%= pkg.version %>",
                url: "<%= pkg.homepage %>",
                options: {
                    themedir: "node_modules/yuidoc-clear-theme",
                    paths: ["lib/"],
                    outdir: "docs/"
                }
            }
        }


    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks("grunt-jscs");

    // Local tasks
    grunt.loadTasks("tasks");

    // By default, lint and run all tests.
    grunt.registerTask("default", ["jscs", "jshint", "test"]);

};
