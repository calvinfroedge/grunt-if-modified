# grunt-if-modified

> Conditionally run grunt tasks only if a source directory has been changed since the last time the task was run

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-if-modified --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-if-modified');
```

## The "if_modified" task

### How to use
In your project's Gruntfile, add a section named `if_modified` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  if_modified: {
    your_group_here: {
      // Task-specific options go here.
      dirs: {
        'dir_in_same_path_as_Gruntfile/otherfolder': ['task_you_want_to_run'],
        'another_folder': 'task_to run',
        'and_another': ['one task', 'two task', 'three']
      }
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History
0.0.1 - Initial concept and tests, as yet unproven in production
