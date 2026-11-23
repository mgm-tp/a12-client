// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * @packageDocumentation
 * @module datagraph
 * @experimental
 */
/**
 * From the relationship-engine
 */
import type { DocumentGraph } from "../documentGraph.js";
import type { DgChangeLog } from "../slices.js";
import type { DeepReadonly } from "../utilityTypes.js";

import type { DocumentWithMutationMetadata } from "./documentsWithMetaData.js";
import { documentsWithMetaData } from "./documentsWithMetaData.js";
import type { LinkWithMutationMetadataAndTime } from "./linksWithMetaData.js";
import { linksWithMetaData } from "./linksWithMetaData.js";

/**
 * Contains all effective changes of links and documents from the change log
 */
export interface EffectiveChangeList {
	readonly links: LinkWithMutationMetadataAndTime[];
	readonly documents: DocumentWithMutationMetadata[];
}

/**
 * Returns all effective link and document changes of the changelog
 */
export function toEffectiveChanges(
	documentGraph: DeepReadonly<DocumentGraph>,
	changeLog: DgChangeLog
): EffectiveChangeList {
	return {
		links: linksWithMetaData(documentGraph, changeLog),
		documents: documentsWithMetaData(documentGraph, changeLog)
	};
}
