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
