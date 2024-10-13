import archiver from "archiver";
import fs from "fs";
import process from "process";
import terser from "@rollup/plugin-terser";

const isDevelopment = process.env.BUILD === "development";

export default {
    input: "scripts/_index.mjs",
    output: {
        file: "script.js",
        format: "iife",
        sourcemap: true,
        generatedCode: "es2015",
        plugins: [terser({
            ecma: 2023,
            compress: {
                booleans: false,
                comparisons: true,
                conditionals: false,
                drop_console: isDevelopment ? false : ["assert"],
                drop_debugger: !isDevelopment,
                ecma: 2023,
                join_vars: !isDevelopment,
                keep_classnames: true,
                keep_fargs: true,
                keep_fnames: isDevelopment,
                keep_infinity: true,
                lhs_constants: !isDevelopment,
                passes: 2,
                sequences: false,
                typeofs: false,
            },
            mangle: isDevelopment ? false : { keep_classnames: true, keep_fnames: false },
            format: {
                ascii_only: true,
                beautify: isDevelopment,
                comments: false,
                keep_numbers: true,
            },
            keep_classnames: true,
            keep_fnames: isDevelopment,
        })],
    },
    plugins: [{
        closeBundle() {
            if (isDevelopment) {
                return;
            }

            const start = Date.now();
            const output = fs.createWriteStream("module.zip");
            const archive = archiver("zip", { zlib: { level: 9 } });

            output.on("close", function () {
                console.log(`\x1b[32mcreated \x1b[1mmodule.zip\x1b[21m in \x1b[1m${Date.now() - start}ms\x1b[21m\x1b[39m`);
            });

            archive.on("warning", function (error) {
                throw error;
            });

            archive.on("error", function (error) {
                throw error;
            });

            archive.pipe(output);

            for (const name of ["module.json", "script.js", "script.js.map", "style.css", "LICENSE"]) {
                archive.append(fs.createReadStream(name), { name });
            }

            archive.directory("icons", "icons");
            archive.directory("lang", "lang");

            archive.finalize();
        },
    }],
};
