// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-angular-templatecache': 'templateCache',
            'gulp-minify-html':           'minifyHTML'
        }
    }),
    argv  = require('yargs').argv,
    config = require('./gulp-config.json'),
    browserSync = require('browser-sync').create(),
    historyApiFallback = require('connect-history-api-fallback'),
    spawn = require('child_process').spawn,
    addStream = require('add-stream');

var env = 'dev';
if (argv._[0] === 'prod' || argv._[0] === 'build') env = 'prod';

var isDev = env === 'dev';
var isProd = env === 'prod';


var serverPort = isProd
                  ? 8091
                  : 8081;

var minify = isProd;

var log = plugins.util.log;

log('--------------------------------------------------------');
log('Environment: ' + env);
log('--------------------------------------------------------');

// create a default task and just log a message
gulp.task('default', function() {
  return gutil.log('Gulp is running! ' + JSON.stringify(argv))
});

/**
 * Create index file
 * @return {Stream}
 */
gulp.task('static', function () {
    log('Preparing static files...');

    return gulp.src(config.paths.staticFiles)
               .pipe(gulp.dest(config.paths.build));
});

/**
 * Create index file
 * @return {Stream}
 */
gulp.task('index', function () {
    log('Creating index file...');

    return gulp.src(config.paths.indexFile)
               .pipe(gulp.dest(config.paths.build));
});

gulp.task('js', function () {
  log('Concatenating JS files...');

  return gulp.src(config.paths.js)
     .pipe(plugins.if(isProd, plugins.stripDebug()))
     .pipe(plugins.plumber({
       errorHandler: function (err) {
            plugins.util.log(err.toString());
            this.emit('end');
        }
     }))
     .pipe(plugins.if(!minify, plugins.jshint.reporter('jshint-stylish')))
     .pipe(addStream.obj(prepareTemplates()))
     .pipe(plugins.if(!minify, plugins.sourcemaps.init()))
     .pipe(plugins.concat('main.js'))
     .pipe(plugins.if(minify, plugins.uglify({mangle: false})))
     .pipe(plugins.if(!minify, plugins.sourcemaps.write()))
     .pipe(gulp.dest(config.paths.build + 'js'))
     .on('error', plugins.util.log);
});

/**
 * Concatenate all Vendor JS files
 * @return {Stream}
 */
gulp.task('vendorjs', function () {
  log('Concatenating Vendor JS files...');

  return gulp.src(config.paths.vendorjs)
    .pipe(plugins.if(!minify, plugins.sourcemaps.init()))
    .pipe(plugins.concat('vendor.js'))
    //.pipe(rev())
    .pipe(plugins.if(minify, plugins.uglify()))
    .pipe(plugins.if(!minify, plugins.sourcemaps.write()))
    .pipe(gulp.dest(config.paths.build + 'js'))
    .on('error', plugins.util.log);
});

/**
 * Sass task
 * @return {Stream}
 */
gulp.task('sass', function () {
  log('Compiling SASS files...');

  return gulp.src(config.paths.sass)
     .pipe(plugins.if(!minify, plugins.sourcemaps.init()))
     .pipe(plugins.sass({
       includePaths: ['./bower_components']
     })
     .on('error', plugins.sass.logError))
     .pipe(plugins.autoprefixer({
       browsers: ['ie >= 10', 'last 2 versions'],
       cascade:  false
     }))
     .pipe(plugins.if(minify, plugins.cssnano()))
     .pipe(plugins.if(!minify, plugins.sourcemaps.write()))
     .pipe(gulp.dest(config.paths.build + 'css'))
     .on('error', plugins.util.log);
});

gulp.task('css', ['sass'], function() {
  log('Preparing CSS files...');

  return gulp.src(config.paths.vendorcss)
    .pipe(plugins.concat('vendor.css'))
    .pipe(gulp.dest(config.paths.build + 'css'))
    .on('error', plugins.util.log);
});

gulp.task('data', function () {
    log('Copying data files to build dir...');

    return gulp.src(config.paths.dataFiles)
               .pipe(gulp.dest(config.paths.build + 'data'));
});

gulp.task('config', function () {
    log('Preparing configuration files...');

    var appConfigFilePath = env === 'prod'
                            ? config.paths.configProd
                            : config.paths.configDev;
    log('Using App Config: ' + appConfigFilePath);

    var appConfig = require(appConfigFilePath);

    return plugins.file('config.json', JSON.stringify(appConfig), { src: true })
               .pipe(gulp.dest(config.paths.build + 'data'));
});

gulp.task('fonts', function () {
    log('Copying fonts to build dir...');

    return gulp.src(config.paths.fonts)
               .pipe(gulp.dest(config.paths.build + 'fonts'));
});

/**
 * templateCache
 * @return {Stream}
 */
function prepareTemplates() {
    log('Creating template cache...');

    var templateCacheOptions = {
        root:       './app/',
        module:     'templates',
        standalone: true
    };

    return gulp.src(config.paths.templates)
               .pipe(plugins.templateCache(templateCacheOptions));
}

/**
 * Build task
 * @return {Stream}
 */
gulp.task('build', ['config', 'static', 'vendorjs', 'js', 'css', 'fonts', 'data']);

/**
 * Default gulp task
 * @return {Stream}
 */
gulp.task('default', ['build']);

gulp.task('prod', ['build'], function() {
  log('Running prod task');
  browserSync.init([config.paths.build], {
      server: {
          baseDir:    './build',
          middleware: [historyApiFallback()]
      },
      ui: {
          port: 3005
      },
      port:   serverPort
  });
});

gulp.task('dev', ['build'], function() {
  log('Running dev task');
  browserSync.init([config.paths.build], {
      server: {
          baseDir:    './build',
          middleware: [historyApiFallback()]
      },
      ui: {
          port: 3005
      },
      port:   serverPort
  });

  gulp.watch(config.paths.sass, ['sass']);
  gulp.watch([config.paths.templates, config.paths.js], ['js']);
  gulp.watch(config.paths.vendorjs, ['vendorjs']);
  gulp.watch(config.paths.staticFiles, ['static']);
  gulp.watch(config.paths.dataFiles, ['data']);

  //log('Running reverse-proxy');
  //spawn('node', ['app/app.js'], { stdio: 'inherit' });
});
