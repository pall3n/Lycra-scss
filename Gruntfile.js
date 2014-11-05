'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


/**
 * Grunt module
 */
module.exports = function(grunt) {

	/**
		* Dynamically load npm tasks
	*/
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	grunt.initConfig({

		/**
			* Read text from package.json and assign to pkg var
		*/
		pkg: grunt.file.readJSON('package.json'),


		/**
			* Set project info
		*/
		project: {
			src: 'src',
			dist: 'dist',
			dev: '<%= project.src %>',

			devCssDir: '<%= project.dev %>/scss',
			devSassDir: '<%= project.dev %>/scss',
			devCssFile: 'styles.css',
			devSassFile: 'styles.scss',
			devSass: '<%= project.devSassDir %>/<%= project.devSassFile %>',
			devCss: '<%= project.devCssDir %>/<%= project.devCssFile %>',
			
			sassDir: '<%= project.src %>/lycra.scss',
			sassFile: 'lycra.scss',
			sass: '<%= project.sassDir %>/<%= project.sassFile %>',
			
			cssDir: '<%= project.dist %>/css',
			cssFile: 'lycra.css',
			cssPrefixed: '<%= project.cssDir %>/lycra.prefix.scss',
			css: '<%= project.cssDir %>/<%= project.cssFile %>',
		},


		/**
			* Project banner
			* Dynamically appended to CSS/JS files
			* Inherits text from package.json
		*/
		tag: {
			banner: '/*!\n' +
				' * <%= pkg.name %>\n' +
				' * <%= pkg.title %>\n' +
				' * <%= pkg.url %>\n' +
				' * @author <%= pkg.author %>\n' +
				' * @version <%= pkg.version %>\n' +
				' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
				' */\n'
		},



		/**
			* Includes html snippets
			* https://www.npmjs.org/package/grunt-bake
		*/
		bake: {
			build: {
				options: {
					content: "<%= project.dev %>/data/data.json"
				},

				files: {
					// files go here, like so:
					"<%= project.dev %>/index.html": "<%= project.dev %>/templates/index.html",
				}
			}
		},


		/**
			* Connect port/livereload
			* https://github.com/gruntjs/grunt-contrib-connect
			* Starts a local webserver and injects
			* livereload snippet
		*/
		connect: {
			options: {
				port: 9000,
				hostname: '*'
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [lrSnippet, mountFolder(connect, 'src')];
					}
				}
			}
		},


		/**
			* Clean files and folders
			* https://github.com/gruntjs/grunt-contrib-clean
			* Remove generated files for clean deploy
		*/
		clean: {
			dist: [
				'<%= project.dist %>'
			]
		},



		/**
			* Copy folders/files to destination
			* https://github.com/gruntjs/grunt-contrib-copy
		*/
		copy: {
			dist: {
				// includes files within path and its sub-directories
				expand: true,
				cwd: 'src',
				src: 'lycra.scss/**',
				dest: 'dist/'
			}
		},



		/**
			* Compile Sass/SCSS files
			* https://github.com/gruntjs/grunt-contrib-sass
			* Compiles all Sass/SCSS files and appends project banner
		*/
		sass: {
			dev: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%= project.devCss %>': '<%= project.devSass %>',
					'<%= project.css %>': '<%= project.sass %>'
				}
			},
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%= project.css %>': '<%= project.sass %>'
				}
			}
		},


		/**
			* Autoprefixer
			* Adds vendor prefixes if need automatcily
			* https://github.com/nDmitry/grunt-autoprefixer
		*/
		autoprefixer: {
			options: {
				browsers: [
					'last 2 version',
					'safari 6',
					'ie 9',
					'opera 12.1',
					'ios 6',
					'android 4'
				]
			},
			dist: {
				files: {
					'<%= project.cssPrefixed %>': ['<%= project.css %>']
				}
			}
		},


		/**
			* Opens the web server in the browser
			* https://github.com/jsoverson/grunt-open
		*/
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>',
				app: 'Google Chrome'
			}
		},


		/**
			* Generates a KSS living styleguide
			* https://github.com/t32k/grunt-kss
		*/
		kss: {
			dist: {
				options: {
					includeType: 'css',
					includePath: '<%= project.css %>',
					template: 'dev/styleguide/template'
				},
				files: {
					'dev/styleguide': ['<%= project.sassDir %>/']
				},
			}
		},


		/**
			* Runs tasks against changed watched files
			* https://github.com/gruntjs/grunt-contrib-watch
			* Watching development files and run concat/compile tasks
			* Livereload the browser once complete
		*/
		watch: {
			src: {
				files: '<%= project.sassDir %>/**/*.scss',
				tasks: ['sass:dist', 'autoprefixer:dist']
			},
			dev: {
				files: ['<%= project.sassDir %>/**/*.scss', '<%= project.devSassDir %>/**/*.scss'],
				tasks: ['sass:dev', 'autoprefixer:dist']
			},
			bake: {
				files: ['<%= project.dev %>/templates/**/*.html', '<%= project.dev %>/data/**/*.json'],
				tasks: ['bake:build']
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= project.dev %>/**/*.html',
					'<%= project.cssDir %>/**/*.css',
					'<%= project.jsDistDir %>/js/**/*.js',
					'<%= project.src %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		}

	});

	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('default', [
		'connect:livereload',
		'watch:src'
	]);


	/**
		* Dev task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('dev', [
		// 'copy:lycra',
		'connect:livereload',
		'watch'
	]);


	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('openup', [
		'connect:livereload',
		'open',
		'watch:src'
	]);


	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('openupdev', [
		// 'copy:lycra',
		'connect:livereload',
		'open',
		'watch:dev'
	]);


	/**
		* Build task
		* Run `grunt build` on the command line
		* Then compress all JS/CSS files
	*/
	grunt.registerTask('build', [
		'clean:dist',
		'copy:dist',
		// 'kss'
	]);

};