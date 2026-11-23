// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { Relationship } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/Relationship.js";
import type { GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { FormModel } from "../core/api/model/form-model.js";
import type { NotRelevantConfig } from "../core/api/model/relevance/notRelevantConfig.js";

import type { DocRef } from "./utilityTypes.js";

/**
 * FIXME: should be internal, but is used in uiflows
 *
 * The Document Graph (DG) is the pure data structure and operations on it.
 *
 * - Change logging is supported through an interface, so that change information
 * can be stored outside of the DG.
 * - Data views like Composed Data Documents (Cdd) are supported by exporting relevant
 * data structures and operations (beyond Redux actions).
 */
export interface DocumentGraph {
	readonly documents: DgDocs;
	readonly links: DgLinks;
}

/** FIXME: should be internal, but is used in uiflows */
export interface DgDocs {
	readonly byDocRef: Record<string, DgDocument | undefined>;
}

/** FIXME: should be internal, but is used in uiflows */
export type LoadingState = "missing" | "loading" | "loaded" | "error";

/**
 * FIXME: should be internal, but is used in uiflows
 *
 * A structure which stores alle the non computed fields related to a computed field
 */
export type ComputedFields = Record<string, string[]>;

/* FIXME: should be internal, but is used in uiflows dev app */
export type DgDocument =
	| {
			readonly docRef: DocRef;
			readonly document: GroupInstance;

			// FIXME: replace these direct models object references with references by id
			// all reducers must then be converted to root reducers in order to be able to access the models slice
			// alternatively, the reducers can use the modelsInScene from the action payload

			// TODO: This is a difference to the CDM version
			// by storing the reference to the DM, we avoid DMs and DM resolver (callback functions) as parameters
			readonly documentModel: Model.DocumentAndValidationModel;
			readonly formModel?: FormModel;
			readonly notRelevantConfigs?: NotRelevantConfig[];

			readonly computedFields?: ComputedFields;
			readonly loadingState: "loaded";
	  }
	| {
			readonly docRef: DocRef;
			readonly loadingState: Exclude<LoadingState, "loaded">;
	  };

export type LoadedDgDocument = Exclude<
	DgDocument,
	{
		readonly docRef: DocRef;
		readonly loadingState: Exclude<LoadingState, "loaded">;
	}
>;

/* FIXME: should be internal, but is used in DocumentGraph, which is currently public */
export type DgLinksById = Record<string, DgLinkInternal | undefined>;

/* FIXME: should be internal, but is used in DocumentGraph, which is currently public */
export interface DgLinks {
	readonly byId: DgLinksById;
	// We skip the following properties that would allow more efficient lookup:
	// readonly byRelshModel: { readonly [relshModel: string]: AllLinksForSource };
	// TODO: ^^^ support Ordering per Relsh, but must be properly inserted !
	readonly linkIdsByDocId: Record<string, string[] | undefined>;
}

/* FIXME: should be internal, but is used in public API => initializeDataComponent */
export interface DgLinkInternal {
	readonly linkRef: Relationship.LinkRef;
	readonly rank: number;
	/**
	 * If not null/undefined, the linkDocument can be found in the dg docs
	 */
	readonly linkDocRef?: string | null;
}
