/*
 * grunt-if-modified
 * https://github.com/calvinfroedge/grunt-if-modified
 *
 * Copyright (c) 2014 Calvin Froedge
 * Licensed under the MIT license.
 */

'use strict';

var fs          = require('fs'),
    async       = require('async'),
    taskRunner  = require('../lib/task_runner'),
    CheckSum    = require('../lib/checksum'),
    path        = require('path');

module.exports = function(grunt) {
  grunt.registerMultiTask('if_modified', 'Only execute a grunt task if a directory or the files within it have changes since the last run.', 
  function() {
    var start = new Date();
    var cs = new CheckSum(path.resolve())(this.data.dirs);
    var data = this.data;
    var done = this.async();

    var toApply = function (dir, callbackOnEach) {
        var ran = taskRunner(grunt, [data.dirs[dir]]);
        callbackOnEach(null, ran);
    };

    cs.applyIfChanged(toApply, function(err, result){
        var ran = 0;
        for(var k in result){
            if(result[k] !== false){
                ++ran;
            }
        }

        grunt.log.write('Finished if_modified, ' + ran + ' tasks needed to run. Time: ' + (new Date() - start) + ' ms');
        done();
    });
  });
};

