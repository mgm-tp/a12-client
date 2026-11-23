// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { dirname, relative, resolve } from "node:path";

import type {
	ArrayLiteralExpression,
	Identifier,
	JsxSelfClosingElement,
	Project,
	SourceFile
} from "ts-morph";
import { SyntaxKind } from "ts-morph";

import type { Recipe } from "@com.mgmtp.a12.devtools/codemod";

import {
	isLocalesBind,
	isLocalesUnbind,
	isLoggingBindOrRebind,
	isLoggingUnbind
} from "../utils/expressionMatcher.js";

export const migrateContainerApiRecipe: Recipe = {
	metadata: {
		id: "migrateContainerApi",
		description: "Migrates common usages of the Container API",
		supportedVersions: "^16.0.0"
	},

	execute(project) {
		project.getSourceFiles().forEach(file => {
			file.getDescendantsOfKind(SyntaxKind.ExpressionStatement).forEach(exprStatement => {
				const callExp = exprStatement.getExpressionIfKind(SyntaxKind.CallExpression);

				if (isLoggingUnbind(callExp)) {
					addNamedImport(file, "@com.mgmtp.a12.utils/utils-logging/lib/Settings", "Settings");

					exprStatement.replaceWithText(`Settings.resetLogStrategy()`);
				} else if (
					isLoggingBindOrRebind(callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression))
				) {
					addNamedImport(file, "@com.mgmtp.a12.utils/utils-logging/lib/Settings", "Settings");

					exprStatement.replaceWithText(
						`Settings.LogStrategy = ${callExp?.getArguments().at(0)?.getFullText()}`
					);
				} else if (isLocalesUnbind(callExp)) {
					exprStatement.remove();
				} else if (
					isLocalesBind(callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression))
				) {
					const localeSelect = findLocaleSelect(project);

					const localesArray = callExp?.getArguments().at(0);

					const arrayIdentifier = localesArray?.asKind(SyntaxKind.Identifier);
					handleIdentifier(file, arrayIdentifier, localeSelect?.source);

					const arrayExpression = localesArray?.asKind(SyntaxKind.ArrayLiteralExpression);
					handleExpression(file, arrayExpression, localeSelect?.source);

					createOrUpdateLocalesProp(
						localeSelect?.source,
						localeSelect?.select,
						localesArray?.getFullText()
					);

					exprStatement.remove();
				}
			});

			file
				.getImportDeclarations()
				.find(id =>
					id
						.getModuleSpecifierValue()
						.startsWith("@com.mgmtp.a12.client/client-core/lib/core/configuration")
				)
				?.remove();
		});
	}
};

function handleIdentifier(
	originFile: SourceFile,
	identifier?: Identifier,
	targetFile?: SourceFile
) {
	const symbol = identifier?.getSymbol();
	if (symbol && targetFile) {
		const declarations = symbol.getDeclarations();
		for (const declaration of declarations) {
			const varDeclaration = declaration.asKind(SyntaxKind.VariableDeclaration);

			if (varDeclaration) {
				const arrayExpression = varDeclaration?.getInitializerIfKind(
					SyntaxKind.ArrayLiteralExpression
				);

				handleExpression(originFile, arrayExpression, targetFile);

				const variableText = varDeclaration.getVariableStatementOrThrow().getText();
				targetFile.addStatements(variableText);

				if (variableText?.includes("Locale") && targetFile) {
					addNamedImport(targetFile, "@com.mgmtp.a12.utils/utils-localization/lib/main", "Locale");
				}
			}

			const importSpecifier = declaration.asKind(SyntaxKind.ImportSpecifier);
			if (importSpecifier) {
				const importDeclaration = importSpecifier.getImportDeclaration();

				const oldImportPath = resolve(
					dirname(originFile.getFilePath()),
					importDeclaration.getModuleSpecifierValue()
				);
				const newImportPath = relative(dirname(targetFile.getFilePath()), oldImportPath);

				const adjustedPath = newImportPath.startsWith(".") ? newImportPath : `./${newImportPath}`;

				targetFile.addImportDeclaration({
					namedImports: [importSpecifier.getText()],
					moduleSpecifier: adjustedPath
				});
			}
		}
	}
}

function handleExpression(
	originFile: SourceFile,
	arrayExpression?: ArrayLiteralExpression,
	targetFile?: SourceFile
) {
	arrayExpression?.getElements().forEach(elm => {
		const elmIdentifier = elm.asKind(SyntaxKind.Identifier);
		handleIdentifier(originFile, elmIdentifier, targetFile);
	});
}

function createOrUpdateLocalesProp(
	targetFile?: SourceFile,
	jsx?: JsxSelfClosingElement,
	initText?: string
) {
	if (initText?.includes("Locale") && targetFile) {
		addNamedImport(targetFile, "@com.mgmtp.a12.utils/utils-localization/lib/main", "Locale");
	}

	const existingProp = jsx?.getAttributes().find(attr => {
		const a = attr.asKind(SyntaxKind.JsxAttribute);

		return a?.getNameNode().getText() === "locales";
	});

	if (existingProp) {
		existingProp.asKindOrThrow(SyntaxKind.JsxAttribute).setInitializer(`{${initText}}`);
	} else {
		jsx?.addAttribute({
			name: "locales",
			initializer: `{${initText}}`
		});
	}
}

function addNamedImport(file: SourceFile, moduleSpecifierValue: string, namedImport: string) {
	const importDecl = file
		.getImportDeclarations()
		.find(id => id.getModuleSpecifierValue().startsWith(moduleSpecifierValue));

	if (!importDecl) {
		file.addImportDeclaration({
			moduleSpecifier: moduleSpecifierValue,
			namedImports: [namedImport]
		});

		return;
	}

	const importSpecifier = importDecl?.getNamedImports().find(s => s.getName() === namedImport);

	if (!importSpecifier) {
		importDecl.addNamedImport(namedImport);
	}
}

function findLocaleSelect(
	project: Project
): { source: SourceFile; select: JsxSelfClosingElement } | undefined {
	for (const file of project.getSourceFiles()) {
		const select = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).find(jsx => {
			const importSpec = jsx
				.getTagNameNode()
				.getSymbol()
				?.getDeclarations()
				.at(0)
				?.asKind(SyntaxKind.ImportSpecifier);

			return (
				importSpec?.getName() === "LocaleSelect" &&
				importSpec
					?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
					?.getModuleSpecifierValue()
					.startsWith("@com.mgmtp.a12.client/client-core/lib/core/frame")
			);
		});

		if (select) {
			return { source: file, select };
		}
	}
	return undefined;
}
