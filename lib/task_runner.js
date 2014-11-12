module.exports = function(grunt, task){
    var ran = [];
    if(Array.isArray(task)){
        for(var t in task){
            if(grunt.task.exists(task[t])){
                grunt.task.run(task[t]);
                ran.push(task[t]);
            }
        }
    } else {
        if(grunt.task.exists(task)){
            grunt.task.run(task);
            ran.push(task);
        }
    }

    return ran;
}
