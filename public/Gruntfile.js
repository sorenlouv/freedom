/*jslint node: true */
module.exports = function(grunt) {
  'use strict';

  // Load NPM modules as needed
  require('jit-grunt')(grunt);

  grunt.initConfig({

    /*
    * Project variables
    ****************************/
    dist_js_file: 'dist/freedom.js',
    dist_css_file: 'dist/freedom.css',
    pre_compiled_css_file: 'dist/pre-compiled.css',

    /*
    * Jshint
    * All javascript files in src/js
    * http://jshint.com/docs/options/
    ****************************/
    jshint: {
      files: ['src/js/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /*
    * Concatenate js files
    * All javascript files in src/js
    ****************************/
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: ['src/js/**/*.js'],
        dest: '<%= dist_js_file %>'
      }
    },


    /*
    * Less: compile less to css
    ****************************/
    less: {
      dist: {
        options: {
          paths: ['src/less/']
        },
        src: 'src/less/freedom.less',
        dest: '<%= pre_compiled_css_file %>'
      }
    },

    /*
    * Prefixer: Add/remove css prefixes
    ****************************/
    autoprefixer: {
      dist: {
        options: {
          browsers: ['last 2 version', 'ie 9']
        },
        src: '<%= pre_compiled_css_file %>',
        dest: '<%= dist_css_file %>'
      }
    },

    /*
    * CssLint
    * Final distribution css file
    ****************************/
    csslint: {
      options: {
        csslintrc: '.csslintrc' // Get CSSLint options from external file.
      },
      strict: {
        src: ['<%= dist_css_file %>']
      }
    },

    /*
    * Watch changes and invoke specified tasks
    ****************************/
    watch: {
      options: {
        livereload: true
      },

      // Javacript: jshint and concat
      js: {
        files: 'src/js/**/*.js',
        tasks: ['jshint', 'concat']
      },

      // Less: Compiles to CSS and CSSLint (no page-reload)
      less: {
        files: 'src/less/**/*.less',
        tasks: ['less:dist'],
        options: {
          livereload: false
        }
      },

      // Prefix and CSSLint
      css: {
        files: '<%= pre_compiled_css_file %>',
        tasks: ['autoprefixer:dist', 'csslint'],
        options: {
          livereload: false
        }
      },

      // Live reload on change (no tasks)
      css_reload: {
        files: '<%= dist_css_file %>'
      },

      // Live reload on change (no tasks)
      templates: {
        files: ['templates/**/*.html', 'index.html']
      }
    }
  });

  /*
  * Default tasks
  ****************************/
  grunt.registerTask('default', ['jshint', 'concat', 'less:dist', 'autoprefixer:dist', 'csslint']);

};
