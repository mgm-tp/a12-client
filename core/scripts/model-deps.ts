#!/usr/bin/env node
// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/* oxlint-disable no-console */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { argv, cwd } from "node:process";

import type { ModelReference } from "@com.mgmtp.a12.base/base-model-api/lib/main/header/index.js";
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

if (argv.length !== 3) {
	exitWithError(
		"Model dependencies analyzer",
		"Output model dependencies as dot graph",
		"Usage: <models folder>"
	);
}

const modelsFolder = argv[2];
const modelsFolderAbs = resolve(cwd(), modelsFolder);

console.log("Digraph D {");
for (const fname of readdirSync(modelsFolderAbs)) {
	const fullPath = resolve(modelsFolderAbs, fname);
	processFile(fullPath);
}
console.log("}");

function processFile(fname: string) {
	const stat = statSync(fname);
	if (!stat.isFile()) {
		return;
	}
	const json = readJson(fname);
	if (!isModelInstance(json)) {
		return;
	}
	const { id, modelReferences = [] } = json.header;
	printDeps(id, modelReferences);
}

function printDeps(startNode: string, references: ModelReference[]) {
	const endNodes = references.map(r => `"${r.reference}"`);
	console.log(`"${startNode}" -> {${endNodes.join(", ")}}`);
}

function readJson(file: string) {
	try {
		return JSON.parse(readFileSync(file, "utf-8"));
	} catch {
		return undefined;
	}
}

function exitWithError(...msgs: unknown[]) {
	msgs.forEach(msg => console.error(msg));
	process.exit(1);
}
