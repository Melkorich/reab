const buildFolder = './build'
const srcFolder = './src'

const path = {
    build: {
        html: buildFolder + '/',
        css: buildFolder + '/css/',
        js: buildFolder + '/js/',
        img: buildFolder + '/img/',
        fonts: buildFolder + '/fonts/',
    },
    src: {
        // html: [srcFolder + '/*.html', '!' + srcFolder + '/_*.html'],
        html: srcFolder + '/*.html',
        scss: srcFolder + '/scss/style.scss',
        js: srcFolder + '/js/scripts.js',
        img: srcFolder + '/img/**/*.+(png|jpg|jpeg|ico|svg|webp)',
        svg: srcFolder + '/img/svg/*.svg',
        fonts: srcFolder + '/fonts/*',
    },
    watch: {
        html: srcFolder + '/**/*.html',
        scss: srcFolder + ['/scss/**/*.scss'],
        js: srcFolder + '/js/**/*.js',
        img: srcFolder + '/img/**/*.+(png|jpg|jpeg|ico|svg|webp)',
        fonts: srcFolder + '/fonts/*',
    },
    clean: buildFolder,
}

const { src, dest } = require('gulp');
const gulp = require('gulp');

const del = require('del');
const fileinclude = require('gulp-file-include');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpHtml = require('gulp-webp-html');
const htmlmin = require('gulp-htmlmin');
const wepbCss = require('gulp-webp-css');
const svgSprite = require('gulp-svg-sprite');
const plumber = require("gulp-plumber");
const notify = require('gulp-notify');
const browsersync = require('browser-sync').create()

// Browser Sync
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + buildFolder + '/',
        },
        port: 3000,
        notify: false,
    })
}

// Clean
const clean = () => {
    return del(path.clean)
}


function html() {
    return src(path.src.html)
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Html",
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.reload({ stream: true }))
}

function htmlBuild() {
    return src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(webpHtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.reload({ stream: true }))
}


function img() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

// Images
function imgBuild() {
    return src(path.src.img)
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Images",
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(webp())
        .pipe(
            imagemin({
                progressive: true,
                verbose: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

// Fonts
function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream())
}

// JavaScript
function js() {
    return src(path.src.js, { sourcemaps: true })
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "JavaScript",
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

// CSS
function styles() {
    return src(path.src.scss, { sourcemaps: true })
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Styles",
                    sound: false,
                    message: err.message
                };
            })
        }))
        .pipe(scss({ outputStyle: 'expanded' }))
        .pipe(wepbCss())
        .pipe(gcmq())
        .pipe(
            autoprefixer({
                cascade: true,
                overrideBrowserslist: ['last 5 versions'],
            }),
        )
        .pipe(dest(path.build.css))
        .pipe(cleanCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(dest(path.build.css, { sourcemaps: true }))
        .pipe(browsersync.stream())
}

function svgSprites() {
    return src(path.src.svg)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(dest(path.build.img))
}

// Watch Files
function watchFiles(params) {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.scss], styles)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], img)
    gulp.watch([path.watch.fonts], fonts)
}


// const build = gulp.series(clean, gulp.parallel(html, js, styles, images, svgSprites, fonts))
// const build = gulp.series(clean, gulp.parallel(html, js, styles, imgBuild, svgSprites, htmlBuild, fonts))
const build = gulp.series(clean, gulp.parallel(htmlBuild, js, styles, img, imgBuild, svgSprites, fonts))


// Without clean build
const dev = gulp.series(clean, gulp.parallel(html, js, styles, img, svgSprites, fonts))
const watch = gulp.parallel(dev, watchFiles, browserSync)

exports.imgBuild = imgBuild
exports.htmlBuild = htmlBuild
exports.img = img
exports.svgSprites = svgSprites
exports.js = js
exports.html = html
exports.styles = styles
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
