const path = require('path');
const open = require('opn');
var gulp = require('gulp');
var favicons = require("favicons").stream,
    log = require("fancy-log");
var sass = require('gulp-sass');
const connect = require('gulp-connect');
const lighthouse = require('lighthouse');
const printer = require('lighthouse/lighthouse-cli/printer');

const chromeLauncher = require('chrome-launcher');
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
const PORT = 8080;

sass.compiler = require('node-sass');

//#region favicon
gulp.task("favicon", function() {
    // Logo file: https://www.figma.com/file/BwQ3Bp3JmhtxQR5ZJsNpis
    return gulp.src("./img/logo.png").pipe(favicons({
            appName: "",
            appShortName: "",
            appDescription: "",
            developerName: "Zafer AYAN",
            developerURL: "https://twitter.com/ZaferAyan",
            lang: "tr-TR",
            background: "#fff",
            theme_color: "#4050F5",
            appleStatusBarStyle: "black-translucent",
            path: "img/favicon",
            url: "",
            display: "standalone",
            orientation: "portrait",
            scope: "/",
            start_url: "/",
            version: 1.0,
            logging: false,
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: true,
                coast: true,
                favicons: true,
                firefox: true,
                windows: true,
                yandex: true
            },
            html: "../../index_favicons.html",
            pipeHTML: true,
            replace: true
        }))
        .on("error", log)
        .pipe(gulp.dest("./img/favicon"));
});
//#endregion

//#region sass
gulp.task('sass', function() {
    return gulp.src('./css/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});
//#endregion

//#region watch

gulp.task('watch', function() {
    gulp.watch('./css/**/*.scss', gulp.series('sass'));
});

//#endregion


//#region lighthouse

gulp.task('lighthouse', function() {
    const flags = {
        chromeFlags: ['--show-paint-rects'],
        output: 'html'
    }; // available options - https://github.com/GoogleChrome/lighthouse/#cli-options
    const config = require('./gulp_lighthouse_config.js');
    connect.server({
        root: './',
        port: PORT,
    })
    return launchChromeAndRunLighthouse(`http://localhost:${PORT}/index.html`, flags, config)
        .then(function(results) {
            writeToHtml(results);
            // console.log(results);
            return results;
        })
        .catch(function(e) {
            connect.serverClose();
            console.error(e);
            throw e;
        });
});

function launchChromeAndRunLighthouse(url, flags, config = null) {
    return chromeLauncher.launch().then(chrome => {
        flags.port = chrome.port;
        return lighthouse(url, flags, config).then(results =>
            chrome.kill().then(() => results)
        );
    });
}

function writeToHtml(results) {
    const date = new Date();
    const zero = (n) => {
        return n < 10 ? `0${n}` : n;
    };
    const Y = date.getFullYear();
    const M = zero(date.getUTCMonth() + 1);
    const d = zero(date.getUTCDate());
    const h = zero(date.getHours());
    const m = zero(date.getMinutes());
    const s = zero(date.getSeconds());
    const filename = `lighthouse_report-${Y}-${M}-${d}-${h}.${m}.${s}.html`;
    const outputPath = path.resolve('.', './report', filename); +

    printer.write(reportGenerator.generateReportHtml(results.lhr), 'html', outputPath).then(() => {
        open(outputPath, { wait: false });
        connect.serverClose();
    });
}
//#endregion