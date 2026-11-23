// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
