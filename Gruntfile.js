/*
 * grunt-gabarito
 * https://github.com/pablo/grunt-gabarito
 *
 * Copyright (c) 2015 Pablo Cabrera
 * Licensed under the MIT license.
 */


module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'tasks/*.js'],

            options: {
                jshintrc: true
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint']);

};