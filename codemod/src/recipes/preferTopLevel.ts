// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import {
	migrateImports,
	type ImportMigrationConfiguration,
	type Recipe
} from "@com.mgmtp.a12.devtools/codemod";

const packageName = "@com.mgmtp.a12.client/client-core";
const dataPackageName = "@com.mgmtp.a12.client/client-data";

const migrationConfig: ImportMigrationConfiguration = {
	pathMigrations: [
		{ from: `${dataPackageName}/lib/**`, to: dataPackageName },
		{ from: `${packageName}/lib/core/**`, to: packageName },
		{
			from: `${packageName}/lib/extensions/appModelAdapter/**`,
			to: `${packageName}/appModelAdapter`
		},
		{
			from: `${packageName}/lib/extensions/dataServicesAdapter/**`,
			to: `${packageName}/dataServicesAdapter`
		},
		{
			from: `${packageName}/lib/extensions/deep-linking/**`,
			to: `${packageName}/deepLinking`
		},
		{
			from: `${packageName}/lib/extensions/dirtyHandling/**`,
			to: `${packageName}/dirtyHandling`
		},
		{
			from: `${packageName}/lib/extensions/heterogeneity/**`,
			to: `${packageName}/heterogeneity`
		},
		{
			from: `${packageName}/lib/extensions/localization/**`,
			to: `${packageName}/localization`
		},
		{ from: `${packageName}/lib/extensions/modelLoader/**`, to: `${packageName}/modelLoader` }
	]
};

export const preferTopLevelImportsRecipe: Recipe = {
	metadata: {
		id: "preferTopLevel",
		description: "Migrates imports from deep paths to top-level imports",
		supportedVersions: "^16.2.0"
	},

	execute(project): void {
		project.getSourceFiles().forEach(file => migrateImports(file, migrationConfig));
	}
};
