// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { join } from "node:path";
import { describe } from "node:test";

import { migrateContainerApiRecipe } from "../recipes/migrateContainerApi.js";

import { testRecipe } from "./testReceipe.js";

describe("codemod.recipes.migrateContainerApi", () => {
	describe("Migrate Container API using commonjs files", () => {
		testRecipe(migrateContainerApiRecipe, join("migrateContainerApi", "tsconfig.json"));
	});

	describe("Migrate Container API using ESM files", () => {
		testRecipe(migrateContainerApiRecipe, join("migrateContainerApi", "tsconfig.esm.json"));
	});

	describe("Migrate locales property correctly when locales are inlined", () => {
		testRecipe(
			migrateContainerApiRecipe,
			join("migrateContainerApi", "tsconfig.localesInline.json")
		);
	});

	describe("Migrate locales property correctly when locales are defined as a variable", () => {
		testRecipe(
			migrateContainerApiRecipe,
			join("migrateContainerApi", "tsconfig.localesInline2.json")
		);
	});

	describe("Migrate locales property correctly when imported", () => {
		testRecipe(
			migrateContainerApiRecipe,
			join("migrateContainerApi", "tsconfig.localesImport.json")
		);
	});
});
