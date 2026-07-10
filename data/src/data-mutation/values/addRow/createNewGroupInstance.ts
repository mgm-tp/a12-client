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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	DocumentModel,
	EntityInstancePath,
	FieldInstanceValue,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade";

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
