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

import type { ImportDeclaration, ImportSpecifier, SourceFile } from "ts-morph";

import type { Recipe } from "@com.mgmtp.a12.devtools/codemod";

const TYPESCRIPT_FSA_REDUX_COMPAT = "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
const TYPESCRIPT_FSA = "typescript-fsa";
const REDUX = "redux";

export const migrateAnyActionTypeRecipe: Recipe = {
	metadata: {
		id: "migrateAnyActionType",
		description: "Migrates AnyAction from typescript-fsa AND from redux to Action from redux",
		supportedVersions: "^17.0.0"
	},

	execute(project): void {
		project.getSourceFiles().forEach(file => {
			const anyActionImports = findAnyActionImports(file);

			if (anyActionImports.length === 0) {
				return;
			}

			const actionTypeName = ensureReduxActionImport(file);
			anyActionImports.forEach(importSpecifier =>
				migrateAnyActionImport(importSpecifier, actionTypeName)
			);
		});
	}
};

function findAnyActionImports(file: SourceFile): ImportSpecifier[] {
	return file
		.getImportDeclarations()
		.filter(importDeclaration => {
			const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
			return (
				moduleSpecifier === TYPESCRIPT_FSA ||
				moduleSpecifier === TYPESCRIPT_FSA_REDUX_COMPAT ||
				moduleSpecifier === REDUX
			);
		})
		.flatMap(importDeclaration => importDeclaration.getNamedImports())
		.filter(importSpecifier => importSpecifier.getName() === "AnyAction");
}

function migrateAnyActionImport(importSpecifier: ImportSpecifier, actionTypeName: string): void {
	const importDeclaration = importSpecifier.getImportDeclaration();
	const localNameNode = importSpecifier.getAliasNode() ?? importSpecifier.getNameNode();
	const references =
		"findReferencesAsNodes" in localNameNode ? localNameNode.findReferencesAsNodes() : [];

	references.forEach(reference => reference.replaceWithText(actionTypeName));
	importSpecifier.remove();

	const hasNoNamedImports = importDeclaration.getNamedImports().length === 0;
	const hasNoDefaultImport = !importDeclaration.getDefaultImport();
	const hasNoNamespaceImport = !importDeclaration.getNamespaceImport();

	if (hasNoNamedImports && hasNoDefaultImport && hasNoNamespaceImport) {
		importDeclaration.remove();
	}
}

function ensureReduxActionImport(file: SourceFile): string {
	const reduxImportDeclaration = findReduxImportDeclaration(file);
	const existingReduxActionImport = reduxImportDeclaration
		?.getNamedImports()
		.find(importSpecifier => importSpecifier.getName() === "Action");

	if (existingReduxActionImport) {
		return existingReduxActionImport.getAliasNode()?.getText() ?? "Action";
	}

	const actionTypeName = hasLocalName(file, "Action") ? "ReduxAction" : "Action";
	if (!reduxImportDeclaration) {
		file.addImportDeclaration({
			moduleSpecifier: REDUX,
			namedImports: [actionTypeName === "Action" ? "Action" : `Action as ${actionTypeName}`]
		});

		return actionTypeName;
	}

	addNamedImport(
		reduxImportDeclaration,
		"Action",
		actionTypeName === "Action" ? undefined : actionTypeName
	);

	return actionTypeName;
}

function findReduxImportDeclaration(file: SourceFile): ImportDeclaration | undefined {
	return file
		.getImportDeclarations()
		.find(importDeclaration => importDeclaration.getModuleSpecifierValue() === REDUX);
}

/**
 * Checks whether the given name is already bound in the file's module scope, no matter if by an
 * import or by a local declaration (type alias, interface, class, variable, ...).
 */
function hasLocalName(file: SourceFile, localName: string): boolean {
	return file.getLocal(localName) !== undefined;
}

function addNamedImport(
	importDeclaration: ImportDeclaration,
	importedName: string,
	alias?: string
): void {
	const namedImportSpecifier = importDeclaration
		.getNamedImports()
		.find(importSpecifier => importSpecifier.getName() === importedName);

	if (!namedImportSpecifier) {
		importDeclaration.addNamedImport(alias ? `${importedName} as ${alias}` : importedName);
	}
}
