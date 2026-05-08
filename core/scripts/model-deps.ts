#!/usr/bin/env node
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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

/* eslint-disable no-console */

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
