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

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import type { LocalizedModelText } from "@com.mgmtp.a12.utils/utils-localization";

import { DocumentModelLocalizableFactory } from "../../kernel-extension/documentModelLocalizableFactory.js";

describe("kernel-extension.documentModelLocalizableFactory", () => {
	describe("fieldLabel", () => {
		it("returns a localizable for a field", () => {
			const result = DocumentModelLocalizableFactory.fieldLabel(
				"dmName",
				stringField({ label: [{ locale: "en", text: "Field Label" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.label.dmName.some.path");
			strictEqual(result[0].defaults?.en, "Field Label");
		});

		it("returns a localizable for a multi-select group by using the label of the value field", () => {
			const result = DocumentModelLocalizableFactory.fieldLabel(
				"dmName",
				multiSelect({ label: [{ locale: "en", text: "Value Field Label" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.label.dmName.some.path.testField");
			strictEqual(result[0].defaults?.en, "Value Field Label");
		});

		it("returns a localizable for a regular group", () => {
			const result = DocumentModelLocalizableFactory.fieldLabel(
				"dmName",
				group({ label: [{ locale: "en", text: "Group Label" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.label.dmName.some.path");
			strictEqual(result[0].defaults?.en, "Group Label");
		});
	});

	describe("fieldHint", () => {
		it("returns a localizable for a field", () => {
			const result = DocumentModelLocalizableFactory.fieldHint(
				"dmName",
				stringField({ externalDescription: [{ locale: "en", text: "Field hint" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.hint.dmName.some.path");
			strictEqual(result[0].defaults?.en, "Field hint");
		});

		it("returns a localizable for a multi-select group", () => {
			const result = DocumentModelLocalizableFactory.fieldHint(
				"dmName",
				multiSelect({ externalDescription: [{ locale: "en", text: "Multi-select hint" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.hint.dmName.some.path");
			strictEqual(result[0].defaults?.en, "Multi-select hint");
		});

		it("returns a localizable for a regular group", () => {
			const result = DocumentModelLocalizableFactory.fieldHint(
				"dmName",
				group({ externalDescription: [{ locale: "en", text: "Group hint" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.hint.dmName.some.path");
			strictEqual(result[0].defaults?.en, "Group hint");
		});
	});

	describe("fieldHelperText", () => {
		it("returns a localizable for a field", () => {
			const result = DocumentModelLocalizableFactory.fieldHelperText(
				"dmName",
				stringField({ helperText: [{ locale: "en", text: "Field helper text" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.helperText.dmName.some.path");
			strictEqual(result[0].defaults?.en, "Field helper text");
		});

		it("returns a localizable for a multi-select group by using the helper text of the value field", () => {
			const result = DocumentModelLocalizableFactory.fieldHelperText(
				"dmName",
				multiSelect({ helperText: [{ locale: "en", text: "Multi-select helper text" }] }),
				somePath()
			);

			strictEqual(result.length, 1);
			strictEqual(result[0].key, "documentModel.helperText.dmName.some.path.testField");
			strictEqual(result[0].defaults?.en, "Multi-select helper text");
		});

		it("does not return a localizable for a regular group", () => {
			const result = DocumentModelLocalizableFactory.fieldHelperText("dmName", group(), somePath());

			deepStrictEqual(result, []);
		});
	});

	describe("enumerationValue", () => {
		it("should create localizables for enum value with label", () => {
			const enumValue: DocumentModel.EnumValue = {
				value: "Value_1",
				label: [{ locale: "en", text: "Label 1" }]
			};

			const result = DocumentModelLocalizableFactory.enumerationValue(
				"dmName",
				enumValue,
				somePath()
			);

			strictEqual(result.length, 2);

			strictEqual(result[0].key, "documentModel.enumValues.dmName.some.path.Value_1");
			strictEqual(result[0].defaults?.en, "Label 1");

			strictEqual(result[1].key, "documentModel.enumValues.dmName.some.path.Value_1.default");
			deepStrictEqual(result[1].defaults, { en: "Value_1", de: "Value_1" });
		});

		it("should handle enum value without label", () => {
			const enumValue: DocumentModel.EnumValue = {
				value: "OPTION_B"
			};

			const result = DocumentModelLocalizableFactory.enumerationValue(
				"dmName",
				enumValue,
				somePath()
			);

			strictEqual(result.length, 2);

			strictEqual(result[0].key, "documentModel.enumValues.dmName.some.path.OPTION_B");
			deepStrictEqual(result[0].defaults, {});

			strictEqual(result[1].key, "documentModel.enumValues.dmName.some.path.OPTION_B.default");
			deepStrictEqual(result[1].defaults, { en: "OPTION_B", de: "OPTION_B" });
		});
	});

	describe("booleanValue", () => {
		it("returns a localizable for true", () => {
			const result = DocumentModelLocalizableFactory.booleanValue("dmName", somePath(), true);

			strictEqual(result.length, 2);
			strictEqual(result[0].key, "documentModel.boolean.dmName.some.path.true");
			strictEqual(result[1].key, "true");
			deepStrictEqual(result[1].defaults, { en: "yes", de: "ja" });
		});

		it("returns a localizable for false", () => {
			const result = DocumentModelLocalizableFactory.booleanValue("dmName", somePath(), false);

			strictEqual(result.length, 2);
			strictEqual(result[0].key, "documentModel.boolean.dmName.some.path.false");
			strictEqual(result[1].key, "false");
			deepStrictEqual(result[1].defaults, { en: "no", de: "nein" });
		});

		it("returns a localizable for null", () => {
			const result = DocumentModelLocalizableFactory.booleanValue("dmName", somePath(), null);

			strictEqual(result.length, 2);
			strictEqual(result[0].key, "documentModel.boolean.dmName.some.path.null");
			strictEqual(result[1].key, "textOutput.noData");
			deepStrictEqual(result[1].defaults, { en: "no data", de: "keine Daten" });
		});
	});

	describe("confirmValue", () => {
		it("returns a localizable for true", () => {
			const result = DocumentModelLocalizableFactory.confirmValue("dmName", somePath(), true);

			strictEqual(result.length, 2);
			strictEqual(result[0].key, "documentModel.confirm.dmName.some.path.true");
			strictEqual(result[1].key, "true");
			deepStrictEqual(result[1].defaults, { en: "yes", de: "ja" });
		});

		it("returns a localizable for null", () => {
			const result = DocumentModelLocalizableFactory.confirmValue("dmName", somePath(), null);

			strictEqual(result.length, 2);
			strictEqual(result[0].key, "documentModel.confirm.dmName.some.path.null");
			strictEqual(result[1].key, "textOutput.noData");
			deepStrictEqual(result[1].defaults, { en: "no data", de: "keine Daten" });
		});
	});
});

function somePath(): ModelPath {
	return [{ elementName: "some" }, { elementName: "path" }];
}

function stringField(options?: {
	label?: LocalizedModelText;
	externalDescription?: LocalizedModelText;
	helperText?: LocalizedModelText;
}): DocumentModel.Field {
	const { label, externalDescription, helperText } = options ?? {};

	return {
		type: "Field",
		id: "testField-id",
		name: "testField",
		fieldType: { type: "StringType" },
		label,
		externalDescription,
		helperText,
		annotations: []
	};
}

function multiSelect(options?: {
	label?: LocalizedModelText;
	externalDescription?: LocalizedModelText;
	helperText?: LocalizedModelText;
}): DocumentModel.Group {
	const { label, externalDescription, helperText } = options ?? {};

	return {
		type: "Group",
		id: "multiSelectGroup-id",
		name: "multiSelectGroup",
		usageType: "multi-select",
		repeatability: 1,
		elements: [stringField({ label, helperText })],
		// for some reason the DMM puts the externalDescription on the group even though it's modeled in the field editor
		externalDescription,
		annotations: []
	};
}

function group(options?: {
	label?: LocalizedModelText;
	externalDescription?: LocalizedModelText;
}): DocumentModel.Group {
	const { label, externalDescription } = options ?? {};

	return {
		type: "Group",
		id: "testGroup-id",
		name: "testGroup",
		repeatability: 1,
		elements: [],
		label,
		externalDescription,
		annotations: []
	};
}
