// adapted from Obsidian plugin template: https://github.com/obsidianmd/obsidian-sample-plugin
// Authors: Omar Muhammad

import esbuild from 'esbuild'
import process from 'process'
import { runServer } from './index.js'

const mode = process.argv[2]
const prod = mode === 'production'

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    watch: !prod,
    minify: prod,
    treeShaking: true,
    sourcemap: prod ? false : 'inline',
    format: 'cjs',
    target: 'es2016',
    logLevel: 'info',
    outfile: 'public/main.js',
})
    .then(() => !prod && runServer())
    .catch(() => process.exit(1))
