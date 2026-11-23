// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { CallExpression, PropertyAccessExpression } from "ts-morph";
import { SyntaxKind } from "ts-morph";

function isContainerExpression(type: "identifier" | "config", expr?: PropertyAccessExpression) {
	return (
		expr?.getExpressionIfKind(SyntaxKind.Identifier)?.getText() === "Container" &&
		expr?.getName() === type
	);
}

function isContainerIdentifierExpression(
	type: "LoggingStrategy" | "Locales" | "UISettings",
	expr?: PropertyAccessExpression
) {
	const inner = expr?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);

	return isContainerExpression("identifier", inner) && expr?.getName() === type;
}

function isContainerConfigExpression(
	type: "bind" | "unbind" | "rebind",
	expr?: PropertyAccessExpression
) {
	const inner = expr?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);

	return isContainerExpression("config", inner) && expr?.getName() === type;
}

export function isLocalesBind(a?: PropertyAccessExpression) {
	const callExp = a?.getExpressionIfKind(SyntaxKind.CallExpression);

	const inner = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);

	return (
		a?.getName() === "toConstantValue" &&
		isContainerConfigExpression("bind", inner) &&
		isContainerIdentifierExpression(
			"Locales",
			callExp?.getArguments().at(0)?.asKind(SyntaxKind.PropertyAccessExpression)
		)
	);
}

export function isLocalesUnbind(expr?: CallExpression) {
	return (
		isContainerConfigExpression(
			"unbind",
			expr?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression)
		) &&
		isContainerIdentifierExpression(
			"Locales",
			expr?.getArguments().at(0)?.asKind(SyntaxKind.PropertyAccessExpression)
		)
	);
}

export function isLoggingBindOrRebind(a?: PropertyAccessExpression) {
	const callExp = a?.getExpressionIfKind(SyntaxKind.CallExpression);

	const inner = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);

	return (
		a?.getName() === "toConstantValue" &&
		(isContainerConfigExpression("bind", inner) || isContainerConfigExpression("rebind", inner)) &&
		isContainerIdentifierExpression(
			"LoggingStrategy",
			callExp?.getArguments().at(0)?.asKind(SyntaxKind.PropertyAccessExpression)
		)
	);
}

export function isLoggingUnbind(callExp?: CallExpression) {
	const inner = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);

	return (
		isContainerConfigExpression("unbind", inner) &&
		isContainerIdentifierExpression(
			"LoggingStrategy",
			callExp?.getArguments().at(0)?.asKind(SyntaxKind.PropertyAccessExpression)
		)
	);
}
