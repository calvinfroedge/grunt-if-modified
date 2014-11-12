'use strict';

var fs          = require('fs'),
    async       = require('async');

function CheckSum(rootpath){
    this.filename = rootpath + '/.if-modified.checksum';
    this.values = {};
    var that = this;

    /*
     *  Constructor method
     */
    this.init = function(dirs){
        //Check to see if the checksum file exists and create it if it does not   
        if(!fs.existsSync(that.filename)) fs.writeFileSync(that.filename);

        that.loadCheckSumValues();

        for(var d in dirs){
            if(!(d in that.values)){
                that.values[d] = '';
            }
        }

        return that;
    }

    /*
     *  Load existing values from the checksum file
     */
    this.loadCheckSumValues = function(){
        that.values = {};
        var checksums = fs.readFileSync(that.filename);
        checksums.toString().split(',').map(function(p){
          if(p){
            var s = p.split(':');
            if(s.length > 1){
                that.values[s[0]] = s[1].replace(/"\r?\n|\r/, '');
            }
          }
        });

        return that.values;
    }

    /*
     * Check which files have changed
     */
    this.checkIfChanged = function(dir, callbackIfChanged){
        that.generateChecksum(dir, function(newDigest){
            if(Object.keys(that.values).length === 0) that.loadCheckSumValues();

            if(that.values.hasOwnProperty(dir)){
                var oldDigest = that.values[dir];
                
                if(oldDigest !== newDigest){
                    that.values[dir] = newDigest;
                    callbackIfChanged(true);
                } else {
                    callbackIfChanged(false);
                }
                
            }
        });
    };

    /*
     * Generate a checksum for a directory tree
     */
    this.generateChecksum = function(dir, checksumCallback){
        var dirpath = rootpath + '/' + dir;
        require('recursive-readdir')(dirpath, function(err, files){
            if(!err){
                var hash = require('crypto').createHash('md5');
                files.map(function(file){
                  var data = fs.readFileSync(file);
                  hash.update(data.toString());
                });

                var newDigest = hash.digest('hex');
                checksumCallback(newDigest);
            } else {
                console.log('error reading dirpath', dirpath);
                return;
            }
        });
    }

    /*
     *  Write values to the checksum file
     */
    this.writeValues = function(values){
        that.values = values || that.values;

        var data = "";
        var i = 0;
        for(var k in that.values){
            data = data + k + ':' + that.values[k];
            if(i < that.values.length - 1){ 
                data = data + ",";
            }
            ++i;
        }

        fs.writeFileSync(that.filename, data);
    }

    /*
     *  Applies a callback function to each directory that has changed
     */
    this.applyIfChanged = function(func, callbackOnFinish){
        if(Object.keys(that.values).length == 0){
            that.loadCheckSumValues();
        }

        async.map(Object.keys(that.values),
        function(dir, callbackOnEach){
            that.checkIfChanged(dir, function(changed){
                if(changed){
                    func(dir, callbackOnEach);
                } else {
                    callbackOnEach(null, false);
                }
            });
        }, 
        function(err, result){
            that.writeValues();
            callbackOnFinish(err, result);
        });
    }

    /*
     *  Make chainable
     */
    return this.init;  
}

module.change_code = 1;
module.exports = CheckSum;
