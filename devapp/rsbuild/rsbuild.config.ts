/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { env as processEnv } from "node:process";

import { defineConfig, rspack, type ProxyConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";

import packageJson from "../package.json" with { type: "json" };
import { collectA12ModelVersions } from "../scripts/collectA12ModelVersions.ts";
import { createDependencyTreeRoot } from "../scripts/dependencyTree.ts";

import { pluginModelWatcher } from "./pluginModelWatcher.ts";

/**
 * Entry points for the devapp.
 * - index: The primary composable factory API entry
 * - legacy: The pure app model entry
 */
const entries = {
	index: { title: "Client DevApp" },
	legacy: { title: "Client DevApp (Legacy)" }
};

function setupProxy(): ProxyConfig {
	const serverPort = processEnv.SERVER_PORT ?? "9090";
	return {
		"/api": {
			target: `http://localhost:${serverPort}`,
			changeOrigin: true,
			secure: false
		},
		"/statusDataservices": {
			target: `http://localhost:${serverPort}/actuator/health/dataservicesInitializationFinished`,
			changeOrigin: true,
			secure: false,
			pathRewrite: { "^/statusDataservices": "" }
		},
		"/statusContentstore": {
			target: `http://localhost:${serverPort}/actuator/health/contentstoreInitializationFinished`,
			changeOrigin: true,
			secure: false,
			pathRewrite: { "^/statusContentstore": "" }
		}
	};
}

// Note: The paths inside this config are relative to the pwd where rsbuild is
// executed, not relative to this config file.
export default defineConfig(({ envMode, env }) => {
	const profile = env === "production" ? "mock" : (envMode ?? "mock");
	const version = `${processEnv.RELEASE_VERSION ?? packageJson.version} [${(envMode ?? "mock").toUpperCase()}]`;

	return {
		server: {
			port: 8080,
			publicDir: [{ name: "resources/html" }, { name: "target/models", watch: true }],
			proxy: profile === "platform" ? setupProxy() : undefined
		},
		dev: {
			// watching for changes in the client library during development in the client repo
			watchFiles: [{ paths: ["../core/lib"] }]
		},
		source: {
			preEntry: "@com.mgmtp.a12.widgets/widgets-core/styles/basic.css",
			entry: {
				index: `./src/devapp/composable.devapp.tsx`,
				legacy: "./src/devapp/legacy.devapp.tsx"
			},
			define: {
				__VERSION__: JSON.stringify(version),
				__SHORT_VERSION__: JSON.stringify(processEnv.RELEASE_VERSION ?? packageJson.version),
				__DEPENDENCY_TREE_ROOT__: JSON.stringify(createDependencyTreeRoot()),
				SC_DISABLE_SPEEDY: false,
				__A12_MODEL_VERSIONS__: JSON.stringify(collectA12ModelVersions()),
				__PROFILE__: JSON.stringify(profile),
				__DOCS_AVAILABLE__: JSON.stringify(env === "production")
			}
		},
		resolve: {
			dedupe: ["scheduler", "react-is", "clsx", "big.js"]
			// TODO: A12C-3273
			// alias: {
			// 	// necessary for WhyDidYouRender to track useSelector
			// 	"react-redux": env === "development" ? "react-redux/lib" : "react-redux"
			// }
		},
		html: {
			template: "resources/html/index.html",
			templateParameters: ({ entryName }) => ({
				title: entries[entryName as keyof typeof entries]?.title ?? "Client DevApp"
			})
		},
		plugins: [pluginReact(), pluginModelWatcher(profile)],
		tools: {
			rspack(config, { addRules, appendPlugins }) {
				addRules({ test: /\.js$/, loader: "source-map-loader", enforce: "pre" });

				if (envMode === "analyze") {
					appendPlugins(new RsdoctorRspackPlugin());
				}

				config.optimization ??= {};
				config.optimization.minimizer = [
					new rspack.SwcJsMinimizerRspackPlugin({
						minimizerOptions: {
							mangle: { keep_fnames: true }
						}
					})
				];
			}
		},
		output: {
			sourceMap: {
				js: env === "production" ? "source-map" : "cheap-module-source-map"
			}
		},
		performance: {
			printFileSize: {
				compressed: false
			}
		}
	};
});
