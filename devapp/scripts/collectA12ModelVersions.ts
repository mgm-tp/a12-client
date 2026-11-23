// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { validRange } from "semver";

export function collectA12ModelVersions() {
	const nodeModulesPath = join(import.meta.dirname, "..", "node_modules");

	const modelVersionMap: Record<string, string> = {};

	for (const a12ScopeDir of readdirSync(nodeModulesPath)) {
		if (!a12ScopeDir.startsWith("@com.mgmtp.a12")) {
			continue;
		}

		// scan sub directories for package.json files
		const scopeDirPath = join(nodeModulesPath, a12ScopeDir);
		for (const a12Library of readdirSync(scopeDirPath)) {
			const packageJsonPath = join(scopeDirPath, a12Library, "package.json");
			if (!existsSync(packageJsonPath)) {
				continue;
			}

			const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: "utf-8" }));
			const { modelVersion, modelType } = packageJson;

			if (modelType && modelVersion) {
				if (!validRange(modelVersion)) {
					throw new Error(
						`Version range specification '${modelVersion}' for model type [${modelType}] is not a valid semver range.`
					);
				}
				modelVersionMap[modelType] = modelVersion;
			}
		}
	}
	return modelVersionMap;
}
