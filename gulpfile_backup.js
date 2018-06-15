var gulp = require('gulp');
var livereload = require('gulp-livereload'), // 网页自动刷新（文件变动后即时刷新页面）
	webserver = require('gulp-webserver'), // 本地服务器
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	pump = require('pump'),
	babel = require('gulp-babel'),
	// minifyCSS = require('gulp-minify-css'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	cssnano = require('cssnano'),
	autofixer = require('autoprefixer'),
	imagemin = require('gulp-imagemin'),
	tinyPng = require('imagemin-pngquant'),
	clean = require('gulp-clean'),
	changed = require('gulp-changed'),
	sourcemaps = require('gulp-sourcemaps'),
	htmlmin = require('gulp-htmlmin'),
	gulpCopy = require('gulp-copy'),
	minifyCSS = require('gulp-clean-css'),
	runSequence  = require('run-sequence'),
	browserSync = require('browser-sync').create(),
	rev = require('gulp-rev'), // 缓存控制
	revCollector = require('gulp-rev-collector'); // 缓存控制


// clean build folder.
gulp.task('cleanbuild', function (cb) {
	var stream = gulp.src('./build/', {read: false}).pipe(clean());

	console.log('build目录删除成功！');
	return stream;

});

// 转化scss为css,并添加前缀及压缩处理
gulp.task('scss', function () {
	var plugins  = [
		autofixer({browsers: ["last 2 versions", "> 1%", "iOS >= 7","Android >= 4.1", "not ie <= 8"]}),
		cssnano()
		];

	var stream = gulp.src('./src/assets/css/**/*.scss')
				.pipe(sourcemaps.init())
				.pipe(sass().on('error', sass.logError))
				.pipe(postcss(plugins))
				.pipe(sourcemaps.write('./'))
				.pipe(gulp.dest('./build/assets/css/'));

	console.log('自定义scss处理成功！');
	return stream;
});

// 复制*.css， 如果添加第三方.css文件时请执行该文件
gulp.task('copycss', function () {
	var stream = gulp.src('./src/assets/css/3rdlibs/**/*.css')
				.pipe(sourcemaps.init())
				.pipe(minifyCSS({
					compatibility: 'ie8',
					keepSpecialComments: '*'
				}))
				.pipe(sourcemaps.write('./'))
				.pipe(gulp.dest('./build/assets/css/3rdlibs/'));

	console.log('第三方.css文件压缩处理成功！');
	return stream;
});

// js第三方插件压缩处理(*.min.js文件除外)
gulp.task('compress', function (cp) {
	pump([
		gulp.src(['./src/assets/js/3rdlibs/**/*.js', '!./src/assets/js/3rdlibs/**/*.min.js']),
		uglify(),
		gulp.dest('./build/assets/js/3rdlibs/')
	], cp);
})

// js非第三方压缩处理支持es6
gulp.task('compressno3rd', function (cp) {
	pump([
		gulp.src(['./src/assets/js/**/*.js', '!./src/assets/js/3rdlibs/**/*.js']),
		sourcemaps.init(),
		babel(),
		uglify({
                mangle: { reserved: ['require', 'exports', 'module', '$'] },
                compress: true
            }),
		sourcemaps.write('./'),
		gulp.dest('./build/assets/js/')
	], cp);
})

// 复制*.min.js. 当添加第三方*.min.js时请执行该命令
gulp.task('copyjs', function () {
	var stream = gulp.src('./src/assets/js/3rdlibs/*.min.js')
				.pipe(gulp.dest('./build/assets/js/3rdlibs/'));

	console.log('第三方js拷贝成功！');
	return stream;
});

// 图片压缩
gulp.task('imagemin', function () {
	var stream = gulp.src('./src/assets/images/*')
				.pipe(imagemin())
				.pipe(gulp.dest('./build/assets/images/'));

	console.log('图片压缩成功！');
	return stream;
});

// *.html压缩
gulp.task('htmlmin', function  () {
	var stream = gulp.src('./src/views/**/*.html')
				.pipe(htmlmin({
					removeComments: true,
					collapseWhitespace: true,
					removeEmptyAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					minifyJS: true,
					minifyCSS: true
				}))
				.pipe(gulp.dest('./build/views/'));

	console.log('html文件压缩成功！');
	return stream;
});

// 复制其它不需要处理的文件如fonts下的文件,如有需要在src中进行设置。
gulp.task('copyfile', function () {

	var stream = gulp.src('./src/assets/fonts/')
				.pipe(gulp.dest('./build/assets/'));

	console.log('不需要处理的文件拷贝成功！');
	return stream;
});


// 注册任务
gulp.task('webserver', function() {
  gulp.src('./build/')
  .pipe(webserver({ // 运行gulp-webserver
  	host: 'localhost',
  	port: 8081,
    livereload: true, // 启用LiveReload
    open: true, // 服务器启动时自动打开网页
    proxies: [
    {
    	source: '/v0/usermanagement/login',
    	target: 'http://10.0.22.58:12583/v0/usermanagement/login',
    	options: {
    		headers: {
    			'content_type': 'application/json'
    		}
    	}
    },
    {
    	source: '/v0/usermanagement/qrLogin',
    	target: 'http://10.0.22.58:12583/v0/usermanagement/qrLogin',
    	options: {
    		headers: {
    			'content_type': 'application/json'
    		}
    	}
    }
    ]
  }));
});

gulp.task('watch',function(){
  gulp.watch( './src/views/*.html', ['htmlmin']).on('change', browserSync.reload); // 监听根目录下所有.html文件
  gulp.watch(['./src/assets/js/**/*.js', '!./src/assets/js/3rdlibs/**/*.js'], ['compressno3rd']).on('change', browserSync.reload);
  gulp.watch('./src/assets/css/**/*.scss', ['scss']).on('change', browserSync.reload);
});

// 默认任务
// gulp.task('default',['webserver', 'watch']);

/**
 * 开发环境一键处理(如有特别需求，请具体任务执行)
 */
gulp.task('synchandle', ['htmlmin', 'imagemin', 'copycss', 'copyjs', 'copyfile', 'compress']);
gulp.task('dev', function (callback) {
	runSequence('synchandle', 'scss', 'compressno3rd', 'webserver', 'watch', callback);

	console.log('开发环境启动成功！');
}).on('task_err',function(err){
    console.log('开发环境启动失败：', err);
});

/**
 * 生产环境配置 生产阶段一次性处理
 */
// 删除dist下重新复制
gulp.task('cleandist', function (cb) {
	var stream = gulp.src('../resources/webpage/', {read: false})
	.pipe(clean({force: true}));
	console.log('dist文件夹删除成功！');
	return stream;
});

// css复md5处理
gulp.task('prodcssmd5', function () {
	var stream = gulp.src(['./build/assets/**/*.css', './build/assets/**/flexiblefit.js', '!./build/assets/**/*.css.map'])
				.pipe(rev())
				.pipe(gulp.dest('../resources/webpage/assets/'))
				.pipe(rev.manifest({merge: true}))
				.pipe(gulp.dest('./build/assets/css/rev/'));

	console.log('生产环境css md5处理完毕');
	return stream;
});

// 复制js及其他文件
gulp.task('prodjscopy', function () {
	var stream = gulp.src(['./build/assets/**/*.js', './build/assets/**/+(fonts|images)/*', '!./build/assets/**/*.js.map', '!./build/assets/js/global/flexiblefit.js'])
				.pipe(gulp.dest('../resources/webpage/assets/'));

	console.log('生产环境js复制处理完毕');
	return stream;
});

// 复制hml并修改css链接
gulp.task('htmlcopy', function () {
	var stream = gulp.src(['./build/assets/css/rev/rev-manifest.json', './build/views/**/*.html'])
				.pipe(revCollector({
					replaceReved: true
				}))
				.pipe(gulp.dest('../resources/webpage/views/'))

	return stream;
});

/** 生产环境一键处理 **/
gulp.task('prod', function (callback) {
	runSequence('cleandist', 'prodcssmd5', 'prodjscopy', 'htmlcopy')
});


