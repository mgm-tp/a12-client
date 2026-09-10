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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type {
	DocumentModel,
	EntityInstancePath
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocServiceFactory } from "../../../data-mutation/validation-computation/docServiceFactory.js";

import type { DataReference } from "../data-reference.js";

import { DocumentPath } from "./documentPath.js";
import { intersect } from "./intersect.js";

export function applyDataContext(
	dm: DocumentModel,
	modelPaths: ModelPath[],
	dataRef: DataReference
): EntityInstancePath[] {
	return modelPaths.map(path =>
		getDocumentPathWithAllRepetitions(dm, path, DocumentPath.fromString(dataRef))
	);
}

/**
 * @internal
 *
 * Merge the current context with the documentModelPath of the required element
 * E.g. current context:
 * [["rootGroup"], ["detachedRepeat", 2]]
 *
 * documentModelPath of the element:
 * [["rootGroup"], ["detachedRepeat"],["numberField"]]
 *
 * needed documentPath:
 * [["rootGroup"], ["detachedRepeat", 2], ["numberField"]]
 *
 * The function look for every segment of the DocumentModelPath if this segment
 * is in the context. If this is the case, it takes the segment from the context,
 * which is with the needed index.
 *
 * @param context Current data context
 * @param documentModelPath The document model path from which a document path should
 * be created
 */
function getDocumentPathWithAllRepetitions(
	documentModel: DocumentModel,
	modelPath: PathSegment[],
	context: EntityInstancePath
): EntityInstancePath {
	const documentPath = intersect(modelPath, context);

	for (const segment of modelPath.slice(documentPath.length)) {
		documentPath.push({
			...segment,
			index: getIndex(documentModel, [...documentPath, segment])
		});
	}

	return documentPath;
}

interface PathSegment {
	readonly elementName: string;
	readonly index?: number;
}

function getIndex(documentModel: DocumentModel, path: PathSegment[]): number {
	const searchService = DocServiceFactory.get().getDocumentModelSearchService(documentModel);
	const modelElement = searchService.getByPath(path);

	if (!modelElement) {
		throw new Error(
			`Cannot find DM element in model ${
				documentModel.header.id
			} by path ${ModelPath.toString(path)}`
		);
	}

	const segment = path[path.length - 1];
	return segment.index !== undefined
		? segment.index
		: modelElement.type === "Group" && modelElement.repeatability > 1
			? 0
			: 1;
}
