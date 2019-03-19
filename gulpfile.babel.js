const rollup = require('rollup-stream');
const rollupTypescript = require('rollup-plugin-typescript2');
const rollupBabel = require('rollup-plugin-babel');
const rollupSurplus = require('rollup-plugin-surplus');
const rollupNodeResolve = require('rollup-plugin-node-resolve');

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

export const buildElectron = () => gulp
	.src('src/index.ts')
	.pipe(sourcemaps.init())
	.pipe(typescript())
	.pipe(sourcemaps.write(''))
	.pipe(gulp.dest('dist'));

export const buildBrowserStatic = () => gulp
	.src(['src/browser/!(js)/**/*', 'src/browser/*'], {base: 'src'})
	.pipe(gulp.dest('dist'));

export const buildBrowserScripts = () =>
	rollup({
		input: 'src/browser/js/memory.jsx',
		format: 'iife',
		name: 'memoryGame',
		sourcemap: true,
		treeshake: true,
		plugins: [
			rollupSurplus({
				include: ['src/browser/js/**/*.jsx']
			}),
			rollupTypescript(),
			rollupNodeResolve(),
			rollupBabel({
				presets: [
					[
						'@babel/env',
						{
							targets: 'last 4 version'
						}
					]
				]
			})
		]
	})
	.pipe(source('browser/js/memory.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write(''))
	.pipe(gulp.dest('dist'));

export const buildBrowser = gulp.parallel(
	buildBrowserStatic,
	buildBrowserScripts);

export const build = gulp.parallel(
	buildElectron,
	buildBrowser);

export const watch = () => {
	gulp.watch(['src/browser/!(js)/**/*', 'src/browser/*'], buildBrowserStatic);
	gulp.watch('src/browser/js/**/*', buildBrowserScripts);
	gulp.watch('src/{*,!(browser)/**/*}', buildElectron);
};

export default build;
