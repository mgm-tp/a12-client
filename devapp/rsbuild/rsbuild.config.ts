// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { env as processEnv } from "node:process";

import { defineConfig, rspack, type ProxyConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";

import packageJson from "../package.json" with { type: "json" };
import { collectA12ModelVersions } from "../scripts/collectA12ModelVersions.ts";
import { createDependencyTreeRoot } from "../scripts/dependencyTree.ts";

function setupProxy(envMode: string): ProxyConfig | undefined {
	switch (envMode) {
		case "platform":
			return {
				"/api": {
					target: "http://localhost:9090",
					changeOrigin: true,
					secure: false
				},
				"/status": {
					target: "http://localhost:9090/actuator/health/initializationFinished",
					changeOrigin: true,
					secure: false,
					pathRewrite: { "^/status": "" }
				}
			};
		default:
			return undefined;
	}
}

// Note: The paths inside this config are relative to the pwd where rsbuild is
// executed, not relative to this config file.
export default defineConfig(({ envMode, env }) => {
	// for deployments we always use mock mode
	const profile = env === "production" ? "mock" : (envMode ?? "mock");
	const version = `${processEnv.RELEASE_VERSION ?? packageJson.version} [${profile.toUpperCase()}]`;
	const isStandaloneBuild =
		!packageJson.dependencies["@com.mgmtp.a12.client/client-core"].includes("workspace");

	return {
		server: {
			port: 8080,
			publicDir: [{ name: "resources/html" }, { name: "target/models" }],
			proxy: setupProxy(profile)
		},
		// watching for changes in the client library during development in the client repo
		dev: { watchFiles: [{ paths: ["../core/lib"] }] },
		source: {
			entry: { index: `./src/devapp/${profile}.devapp.tsx` },
			define: {
				__VERSION__: JSON.stringify(version),
				__SHORT_VERSION__: JSON.stringify(processEnv.RELEASE_VERSION ?? packageJson.version),
				__DEPENDENCY_TREE_ROOT__: JSON.stringify(createDependencyTreeRoot(isStandaloneBuild)),
				SC_DISABLE_SPEEDY: false,
				__A12_MODEL_VERSIONS__: JSON.stringify(collectA12ModelVersions()),
				__PROFILE__: JSON.stringify(profile)
			}
		},
		resolve: {
			dedupe: ["scheduler", "react-is", "clsx", "big.js"],
			alias: {
				// necessary for WhyDidYouRender to track useSelector
				"react-redux": env === "development" ? "react-redux/lib" : "react-redux"
			}
		},
		html: {
			template: "resources/html/index.html"
		},
		plugins: [pluginReact()],
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
