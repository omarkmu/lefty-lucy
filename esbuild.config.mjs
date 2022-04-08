// adapted from Obsidian plugin template: https://github.com/obsidianmd/obsidian-sample-plugin
// Authors: Omar Muhammad

import esbuild from 'esbuild'
import process from 'process'

const mode = process.argv[2]
const prod = mode === 'production'
const watch = mode === 'watch'

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    watch: watch,
    minify: prod,
    treeShaking: true,
    sourcemap: prod ? false : 'inline',
    format: 'cjs',
    target: 'es2016',
    logLevel: 'info',
    outfile: 'public/main.js',
}).catch(() => process.exit(1))
