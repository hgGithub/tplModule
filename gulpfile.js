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

/********************开发处理******************************/
// clean build folder.
gulp.task('cleanbuild', function (cb) {
	var stream = gulp.src('./build/', {read: false}).pipe(clean());

	console.log('build目录删除成功！');
	return stream;

});

/********************开发images处理******************************/
gulp.task('imagemin', function () {
	var stream = gulp.src('./src/assets/images/*')
				.pipe(imagemin())
				.pipe(gulp.dest('./build/assets/images/'));

	console.log('图片压缩成功！');
	return stream;
});

/********************开发css处理******************************/
// 源文件scss处理
gulp.task('devscsstra', function () {
	var plugins  = [
		autofixer({browsers: ["last 2 versions", "> 1%", "iOS >= 7","Android >= 4.1", "not ie <= 8"]})
		];

	var stream = gulp.src('./src/assets/css/**/*.scss')
				// .pipe(sourcemaps.init())
				.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
				.pipe(postcss(plugins))
				// .pipe(sourcemaps.write('./'))
				.pipe(gulp.dest('./build/assets/css/'));

	console.log('自定义scss处理成功！');
	return stream;
});

// 源文件css copy到build目录
gulp.task('devcopycss', function () {
	var stream = gulp.src('./src/assets/css/**/*.css')
				.pipe(gulp.dest('./build/assets/css/'));

	console.log('源文件css拷贝完成');
	return stream;
});

/********************开发js处理******************************/
// 源文件js复制处理处理
gulp.task('devcopyjsfile', function () {
	var stream = gulp.src('./src/assets/js/**/*.js')
				.pipe(gulp.dest('./build/assets/js/'));

	console.log('源文件js拷贝完成');
	return stream;
});

/********************开发fonts文件处理******************************/
// 源文件fonts复制处理处理
gulp.task('devcopyfonts', function () {
	var stream = gulp.src('./src/assets/fonts/**/*')
				.pipe(gulp.dest('./build/assets/fonts/'));

	console.log('源文件fonts拷贝完成');
	return stream;
});

/********************开发html处理******************************/
// 源文件html copy到build目录
gulp.task('devcopyhtml', function () {
	var stream = gulp.src('./src/views/**/*.html')
				.pipe(gulp.dest('./build/views/'));

	console.log('源文件html拷贝完成');
	return stream;
});

// 注册任务
//请求IP
//var serviseIP = 'http://192.168.0.100:8090';
var serviseIP = 'http://10.0.22.58:12583';

gulp.task('webserver', function() {
  gulp.src('./build/')
  .pipe(webserver({ // 运行gulp-webserver 192.168.1.2:8081
  	host: 'localhost',
  	port: 8081,
    livereload: true, // 启用LiveReload
    open: true, // 服务器启动时自动打开网页
    proxies: [
    {	//登陆接口
    	source: '/v0/usermanagement/login',
    	target: serviseIP + '/v0/usermanagement/login',
    	options: {
    		headers: {
    			'content_type': 'application/json'
    		}
    	}
    },
    {   //app进入时登陆
        source: '/v0/usermanagement/pushAgentInfoDirect',
        target: serviseIP + '/v0/usermanagement/pushAgentInfoDirect',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    {	//获取二维码接口
    	source: '/v0/usermanagement/qrLogin',
    	target: serviseIP + '/v0/usermanagement/qrLogin',
    	options: {
    		headers: {
    			'content_type': 'application/json'
    		}
    	}
    },
    {	//监听用户是否扫描二维码接口
    	source: '/v0/usermanagement/checkQr',
    	target: serviseIP + '/v0/usermanagement/checkQr',
    	options: {
    		headers: {
    			'content_type': 'application/json'
    		}
    	}
    },
    {   //是否隐藏重疾险
        source: '/v0/financialplan/generate',
        target: serviseIP + '/v0/financialplan/generate',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    {   //获取家庭数据图表折线图信息接口
        source: '/v0/financialplan/detail',
        target: serviseIP + '/v0/financialplan/detail',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    {   //上传图片流,获取pdf流
        source: '/v0/pdf/buildPDF',
        target: serviseIP + '/v0/pdf/buildPDF',
        options: {
            headers: {
                'content_type': 'multipart/form-data'
            }
        }
    },
    {   //上传被保险人及家庭成员基本信息
        source: '/v0/familyinfo/submit',
        target: serviseIP + '/v0/familyinfo/submit',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    {   //输入信息,查询匹配信息的的家庭
        source: '/v0/familyinfo/query',
        target: serviseIP + '/v0/familyinfo/query',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    {   //删除指定客户信息
        source: '/v0/familyinfo/deleteFamilyInfo',
        target: serviseIP + '/v0/familyinfo/deleteFamilyInfo',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    {   //查看报告
        source: '/v0/pdf/findPDF',
        target: serviseIP + '/v0/pdf/findPDF',
        options: {
            headers: {
                'content_type': 'application/json'
            }
        }
    },
    ]
  }));
});

gulp.task('watch',function(){
  gulp.watch( './src/views/*.html', ['devcopyhtml']).on('change', browserSync.reload); // 监听根目录下所有.html文件
  gulp.watch('./src/assets/js/**/*.js', ['devcopyjsfile']).on('change', browserSync.reload);
  gulp.watch('./src/assets/css/**/*.scss', ['devscsstra']).on('change', browserSync.reload);
  gulp.watch('./src/assets/css/**/*.css', ['devcopycss']).on('change', browserSync.reload);
});

// 默认任务
// gulp.task('default',['webserver', 'watch']);

/**
 * 开发环境一键处理(如有特别需求，请具体任务执行)
 */

gulp.task('dev', function (callback) {
	runSequence(['devcopyhtml', 'imagemin','devcopyfonts', 'devcopycss', 'devcopyjsfile'], 'devscsstra', 'webserver', 'watch', callback);

	console.log('开发环境启动成功！');
}).on('task_err',function(err){
    console.log('开发环境启动失败：', err);
});


/****************生产处理*************************/
// 删除dist下重新复制
gulp.task('cleandist', function (cb) {
	var stream = gulp.src('../resources/webpage/', {read: false})
	.pipe(clean({force: true}));
	console.log('dist文件夹删除成功！');
	return stream;
});
/****************生产css处理*************************/
// css压缩md5处理
gulp.task('prodcssmd5', function () {
	var stream = gulp.src(['./build/assets/**/*.css'])
				.pipe(minifyCSS({
					compatibility: 'ie8',
					keepSpecialComments: '*'
				}))
				.pipe(rev())
				.pipe(gulp.dest('../resources/webpage/assets/'))
				.pipe(rev.manifest())
				.pipe(gulp.dest('./build/assets/css/rev/'));

	console.log('生产环境css md5处理完毕');
	return stream;
});

/****************生产js处理*************************/
// 生产环境版本控制js
gulp.task('prodjsmd5', function () {
	var stream = gulp.src(['./build/assets/**/flexiblefit.js'])
				.pipe(uglify())
				.pipe(rev())
				.pipe(gulp.dest('../resources/webpage/assets/'))
				.pipe(rev.manifest())
				.pipe(gulp.dest('./build/assets/js/rev/'));

	console.log('生产环境css md5处理完毕');
	return stream;
});

// 第三方js，图片字体文件处理
gulp.task('prod3thjscopy', function () {
	var stream = gulp.src(['./build/assets/**/*.min.js', './build/assets/**/+(fonts|images)/*'])
				.pipe(gulp.dest('../resources/webpage/assets/'));

	console.log('第三方压缩js文件，图片字体文件等处理');
	return stream;
});

// js第三方插件压缩处理(*.min.js文件除外)
gulp.task('prod3thcomcopy', function (cp) {
	pump([
		gulp.src(['./build/assets/js/3rdlibs/**/*.js', '!./build/assets/js/3rdlibs/**/*.min.js']),
		uglify(),
		gulp.dest('../resources/webpage/assets/js/3rdlibs/')
	], cp);
})


// 拷贝压缩转化处理js, 不包括第三方及需要版本控制的js ***
gulp.task('prodjscopy', function (cp) {
	pump([
		gulp.src(['./build/assets/**/*.js', '!./build/assets/js/global/flexiblefit.js', '!./build/assets/js/3rdlibs/**/*.js']),
		babel(),
		uglify({
                mangle: { reserved: ['require', 'exports', 'module', '$'] },
                compress: true
            }),
		gulp.dest('../resources/webpage/assets/')
	], cp);
});

/****************生产jhtml处理*************************/
// 复制hml并修改css链接
gulp.task('htmlcopy', function () {
	// var hanlePages = ['./build/assets/+(css|js)/rev/*.json','./build/views/*.html', '!./build/views/(cusSearch-li|cusSearch|finaDiff|lfInfo|yiBeiInfo|yingBeiInfo).html'];
	var stream = gulp.src(['./build/assets/+(css|js)/rev/*.json','./build/views/**/*.html'])
				.pipe(revCollector({
					replaceReved: true
				}))
				// .pipe(htmlmin({
				// 	removeComments: true,
				// 	collapseWhitespace: false,
				// 	removeEmptyAttributes: true,
				// 	removeScriptTypeAttributes: true,
				// 	removeStyleLinkTypeAttributes: true,
				// 	minifyJS: false,
				// 	minifyCSS: false
				// }))
				.pipe(gulp.dest('../resources/webpage/views/'))

	console.log('html模板压缩及文件版本替换');
	return stream;
});

/** 生产环境一键处理 **/
gulp.task('prod', function (callback) {
	runSequence('cleandist','prodjscopy', 'prod3thcomcopy', 'prod3thjscopy',
		'prodcssmd5', 'prodjsmd5', 'htmlcopy')
});


