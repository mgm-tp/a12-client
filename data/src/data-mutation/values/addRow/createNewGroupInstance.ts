// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	DocumentModel,
	EntityInstancePath,
	FieldInstanceValue,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../../../core/api/data-reference.js";
import type { FormModel } from "../../../core/api/model/form-model.js";
import type { DgClAndValidationDataHolderShape } from "../../../redux/api/types.js";
import { assertObject } from "../../../typeguards.js";
import { DocServiceFactory } from "../../validation-computation/docServiceFactory.js";

import { getRowCountByPath } from "./getRowCountByPath.js";

export function createNewGroupInstance(
	dataHolder: DgClAndValidationDataHolderShape,
	docRef: string,
	dataReference: DataReference,
	groupDocumentPath: EntityInstancePath,
	dm: Model.DocumentAndValidationModel,
	fm?: FormModel,
	indexFieldValue?: string | number | boolean | Date | Date[] | null
) {
	const rowCount = getRowCountByPath(dataHolder, docRef, dataReference);

	const groupInstanceDocumentPath = [
		...groupDocumentPath.slice(0, -1),
		{
			elementName: groupDocumentPath[groupDocumentPath.length - 1].elementName,
			index: rowCount + 1
		}
	];

	const groupModelElement = DocServiceFactory.get()
		.getDocumentModelSearchService(dm as DocumentModel)
		.getByPath(groupDocumentPath);
	assertObject(groupModelElement);

	const groupInstance = createGroupInstanceWithInitialValues(
		groupModelElement,
		groupDocumentPath,
		fm,
		indexFieldValue
	);
	return { groupInstanceDocumentPath, groupInstance };
}

function initialFieldValue(
	fieldPath: ModelPath,
	formModel?: FormModel
): number | string | Date | Date[] | boolean | null {
	const fce =
		formModel &&
		formModel.content.fieldConfiguration.field?.find(fce =>
			ModelPath.equal(fce.elementPath, fieldPath)
		);

	const initialValue = fce && fce.initialValueTyped !== undefined ? fce.initialValueTyped : null;
	return initialValue;
}

function createGroupInstanceWithInitialValues(
	groupElement: DocumentModel.Element,
	groupPath: ModelPath,
	formModel?: FormModel,
	indexFieldValue?: FieldInstanceValue
): GroupInstance {
	const groupInstance: Mutable<GroupInstance> = {};
	if (groupElement.type === "Group") {
		for (const childElement of groupElement.elements) {
			if (childElement.type === "Group" && childElement.repeatability === 1) {
				const child = createGroupInstanceWithInitialValues(
					childElement,
					[...groupPath, { elementName: childElement.name }],
					formModel
				);

				groupInstance[childElement.name] = child;
			} else if (childElement.type === "Field") {
				const fieldPath: ModelPath = [...groupPath, { elementName: childElement.name }];
				const isIndexField = childElement.name === groupElement.indexFieldName;
				const childValue =
					isIndexField && indexFieldValue
						? indexFieldValue
						: initialFieldValue(fieldPath, formModel);

				if (childValue !== undefined && childValue !== null) {
					groupInstance[childElement.name] = childValue;
				}
			}
		}
	}

	return groupInstance;
}

type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};
