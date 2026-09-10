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

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import type { Localizable } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { localizableFromModel } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import { DocumentModelKeyFactory } from "./documentModelKeyFactory.js";
import { createResourceLocalizable, RESOURCE_KEYS } from "./localization/index.js";
import { isMultiSelect as isMultiSelectGroup } from "./multiSelect.js";

export namespace DocumentModelLocalizableFactory {
	export function fieldLabel(
		documentModelName: string,
		modelElement: DocumentModel.Element,
		modelPath: ModelPath
	): Localizable[] {
		if (isMultiSelectGroup(modelElement)) {
			return fieldLabel(documentModelName, modelElement.elements[0], [
				...modelPath,
				{ elementName: modelElement.elements[0].name }
			]);
		}

		const localizableKey = DocumentModelKeyFactory.createKey(documentModelName, "label", modelPath);

		return [localizableFromModel(localizableKey, modelElement?.label)];
	}

	export function fieldHint(
		documentModelName: string,
		modelElement: DocumentModel.Element,
		modelPath: ModelPath
	): Localizable[] {
		const localizableKey = DocumentModelKeyFactory.createKey(documentModelName, "hint", modelPath);

		return [localizableFromModel(localizableKey, modelElement?.externalDescription)];
	}

	export function fieldHelperText(
		documentModelName: string,
		modelElement: DocumentModel.Element,
		modelPath: ModelPath
	): Localizable[] {
		if (isMultiSelectGroup(modelElement)) {
			return fieldHelperText(documentModelName, modelElement.elements[0], [
				...modelPath,
				{ elementName: modelElement.elements[0].name }
			]);
		}

		const localizableKey = DocumentModelKeyFactory.createKey(
			documentModelName,
			"helperText",
			modelPath
		);

		return modelElement.type === "Field"
			? [localizableFromModel(localizableKey, modelElement?.helperText)]
			: [];
	}

	export function enumerationValue(
		documentModelName: string,
		enumValue: DocumentModel.EnumValue,
		modelPath: ModelPath
	): Localizable[] {
		const key = DocumentModelKeyFactory.createKey(
			documentModelName,
			"enumValues",
			modelPath,
			enumValue.value
		);
		const keyForDefault = `${key}.default`;

		return [
			localizableFromModel(key, enumValue.label),
			{
				key: keyForDefault,
				defaults: { en: enumValue.value, de: enumValue.value }
			}
		];
	}

	export function booleanValue(
		documentModelName: string,
		path: ModelPath,
		value: boolean | null
	): Localizable[] {
		const stringValue = String(value);
		const key = DocumentModelKeyFactory.createKey(documentModelName, "boolean", path, stringValue);
		return [
			{ key },
			value === true
				? createResourceLocalizable(RESOURCE_KEYS.true)
				: value === false
					? createResourceLocalizable(RESOURCE_KEYS.false)
					: createResourceLocalizable(RESOURCE_KEYS.textOutput.noData)
		];
	}

	export function confirmValue(
		documentModelName: string,
		path: ModelPath,
		value: true | null
	): Localizable[] {
		const stringValue = String(value);
		const key = DocumentModelKeyFactory.createKey(documentModelName, "confirm", path, stringValue);
		return [
			{ key },
			value
				? createResourceLocalizable(RESOURCE_KEYS.true)
				: createResourceLocalizable(RESOURCE_KEYS.textOutput.noData)
		];
	}
}
