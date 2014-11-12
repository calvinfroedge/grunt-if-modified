'use strict';

var grunt       = require('grunt'),
    fs          = require('fs'),
    path        = require('path'),
    CheckSum    = require('../lib/checksum'),
    gruntConfig = require('../Gruntfile')(grunt),
    taskRunner  = require('../lib/task_runner');

exports.if_modified = {
    setUp: function(done) {
        if(fs.existsSync(path.join(__dirname, '../')+'.if-modified.checksum')){
            fs.unlinkSync(path.join(__dirname, '../')+'.if-modified.checksum');
        }
        // setup here if necessary
        done();
    },
    'Check to make sure a checksum file is automatically generated': function(test){  
        test.expect(1);
        new CheckSum(path.join(__dirname, '..'))();
        test.ok(fs.existsSync(path.join(__dirname, '../')+'.if-modified.checksum'));
        test.done();

    },
    'Make sure we can write and load checksum values from checksum file': function(test){
        test.expect(1);
        var cs = new CheckSum(path.join(__dirname, '..'))();
        cs.writeValues({foo: 'bar'});
        var values = cs.loadCheckSumValues();
        test.equal(values['foo'], 'bar');
        test.done();
    },
    'Make sure we can recognize when a checksum has changed, and call a callback on this condition': function(test){
        test.expect(2);
        var cs = new CheckSum(path.join(__dirname, '..'))();
        cs.generateChecksum('test/assets', function(checksum){
            //Start with a checksum value from the default test state, add a temporary file and make sure the checksum changes
            cs.writeValues({'test/assets':checksum});
            fs.writeFileSync(__dirname + '/assets/' + 'tmp.file');
            cs.checkIfChanged('test/assets', function(changed){
                //This should be changed
                test.equal(true, changed);

                //Now default the test file and the checksum should be as it was before
                fs.unlinkSync(__dirname + '/assets/' + 'tmp.file');
                cs.writeValues({'test/assets':checksum});
                cs.generateChecksum('test/assets', function(oldChecksum){
                    cs.checkIfChanged('test/assets', function(changedAgain){
                        test.equal(false, changedAgain);
                        test.done();    
                    });
                });
            });
        });
    },
    'Make sure we can apply a function to the list of directories whose checksums have changed': function(test){
        test.expect(2);
        //Get the existing checksum
        var cs = new CheckSum(path.join(__dirname, '..'))();
        cs.generateChecksum('test/assets', function(checksum){
            cs.writeValues({'test/assets':checksum});

            //Generate a test file
            fs.writeFileSync(__dirname + '/assets/' + 'tmp.file');

            //Grab the test runner function
            var toApply = function(dir, callbackOnEach){
                var ran = taskRunner(grunt, ['test_task_1']);
                callbackOnEach(null, ran);
            };

            //Apply the test runner function if the dir changed (it should have)
            cs.applyIfChanged(toApply, function(err, result){
                test.equal(result.length, 1);
                test.equal(result[0][0], 'test_task_1');
                test.done();
            });
        });
    },
    'Check to be sure the runner can run both array of tasks and one task': function(test) {
        test.expect(2);

        test.equal(taskRunner(grunt, ['test_task_1'])[0], ['test_task_1'][0]);
        test.equal(taskRunner(grunt, 'test_task_1')[0], ['test_task_1']);

        test.done();
    },
    tearDown: function(done){
        if(fs.existsSync(path.join(__dirname, '../')+'.if-modified.checksum')){
            fs.unlinkSync(path.join(__dirname, '../')+'.if-modified.checksum');
        }
        if(fs.existsSync(__dirname + '/assets/' + 'tmp.file')){
            fs.unlinkSync(__dirname + '/assets/' + 'tmp.file');
        }
        done();
    }
};
