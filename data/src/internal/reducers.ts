// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { Relationship } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/Relationship.js";
import type { GroupInstance } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DgChange } from "../internal/slices.js";

import type { Change, ChangeLog } from "./changeLog/changeLog.js";
import {
	applyChanges,
	clearMarker,
	findMarker,
	newChangeLog,
	trim
} from "./changeLog/changeLogImpl.js";
import type { DocumentGraph } from "./documentGraph.js";
import * as DgOps from "./impl/dg.js";
import * as DocOps from "./impl/docs.js";
import * as LinkOps from "./impl/links.js";
import type { DgChangeLogSlice, DgSlice } from "./slices.js";
import type { DeepReadonly, ElementRef } from "./utilityTypes.js";

/** @internal */
export function initialize(
	documentGraph: DeepReadonly<DocumentGraph>,
	changeLog: ChangeLog<DeepReadonly<DocumentGraph>> = newChangeLog(),
	entryPoint: string | undefined = undefined
): DgSlice & DgChangeLogSlice {
	return { documentGraph, changeLog, entryPoint };
}

/** @internal */
export function mergeInto(
	prev: DgSlice & DgChangeLogSlice,
	partialDg: DeepReadonly<DocumentGraph>
): DgSlice & DgChangeLogSlice {
	const [documentGraph, changes] = DgOps.mergeInto({
		dg: prev.documentGraph,
		partialDg
	});
	const changeLog = applyChanges(prev.changeLog, changes);
	return { documentGraph, changeLog, entryPoint: prev.entryPoint };
}

/** @internal */
export function addLink(
	prev: DgSlice & DgChangeLogSlice,
	arg: {
		linkDescriptor: DeepReadonly<Relationship.LinkDescriptor>;
		linkDoc?: DeepReadonly<GroupInstance>;
	}
): DgSlice & DgChangeLogSlice {
	const [documentGraph, changes] = LinkOps.addLink(
		arg.linkDescriptor,
		arg.linkDoc,
		prev.documentGraph
	);
	const changeLog = applyChanges(prev.changeLog, changes);
	return { documentGraph, changeLog, entryPoint: prev.entryPoint };
}

/** @internal */
export function removeLink(
	prev: DgSlice & DgChangeLogSlice,
	linkRef: Relationship.LinkRef
): DgSlice & DgChangeLogSlice {
	const [documentGraph, changes] = LinkOps.removeLink(linkRef, prev.documentGraph);
	const changeLog = applyChanges(prev.changeLog, changes);
	return { documentGraph, changeLog, entryPoint: prev.entryPoint };
}

/** @internal */
export function addDocument(
	prev: DgSlice & DgChangeLogSlice,
	arg: {
		document: GroupInstance;
		elementRef: ElementRef;
		documentModel: Model.DocumentAndValidationModel;
	}
): DgSlice & DgChangeLogSlice {
	const [documentGraph, changes] = DocOps.addDocument(
		arg.document,
		arg.elementRef,
		arg.documentModel,
		prev.documentGraph as DocumentGraph
	);
	const changeLog = applyChanges(prev.changeLog, changes);
	return { documentGraph, changeLog, entryPoint: prev.entryPoint };
}

/** @internal */
export interface ChangeDocumentArgs {
	elementRef: ElementRef;
	document: GroupInstance;
}

/**
 * @internal
 *
 * Updates the document for the given DG element (ref) with the given document.
 * The elementRef can either refer to vertex or an edge of the graph, i.e. an
 * entity or a link document.
 * @returns the updated DG and change log with a LinkDocChanged change if the
 * given element was a link or a DocChanged change if the given element was an
 * entity document.
 */
export function changeDocument(
	prev: DgSlice & DgChangeLogSlice,
	arg: ChangeDocumentArgs
): DgSlice & DgChangeLogSlice {
	/*
	 * Note: The following code assumes that there will not be any links and
	 * docs in the dg with identical linkIds/docRefs.
	 * If that is the case, we can safely check links first and then fallback to
	 * documents when no link was found for the given elementRef.
	 */
	const dgLink = prev.documentGraph.links.byId[arg.elementRef];

	let documentGraph: DeepReadonly<DocumentGraph>, changes: DgChange[];

	if (dgLink) {
		[documentGraph, changes] = LinkOps.modifyLink(arg.document, arg.elementRef, prev.documentGraph);
	} else {
		[documentGraph, changes] = DocOps.changeDocument(
			arg.document,
			arg.elementRef,
			prev.documentGraph as DocumentGraph
		);
	}
	const changeLog = applyChanges(prev.changeLog, changes);
	return { documentGraph, changeLog, entryPoint: prev.entryPoint };
}

/** @internal */
export const transaction = {
	begin: (prev: DgSlice & DgChangeLogSlice, args: { id: string }): DgSlice & DgChangeLogSlice => {
		const documentGraph = prev.documentGraph;
		const changes: Change<DeepReadonly<DocumentGraph>>[] = [
			{
				kind: "marker",
				id: args.id,
				snapshot: prev.documentGraph
			}
		];
		const changeLog = applyChanges(prev.changeLog, changes);
		return {
			...prev,
			documentGraph,
			changeLog,
			entryPoint: prev.entryPoint
		};
	},

	commit: (prev: DgSlice & DgChangeLogSlice): DgSlice & DgChangeLogSlice => {
		const documentGraph = prev.documentGraph;
		const changeLog = clearMarker(prev.changeLog);
		return {
			...prev,
			documentGraph,
			changeLog,
			entryPoint: prev.entryPoint
		};
	},

	rollback: (prev: DgSlice & DgChangeLogSlice): DgSlice & DgChangeLogSlice => {
		const marker = findMarker(prev.changeLog);
		if (marker === undefined) {
			return prev;
		}
		const documentGraph = marker.snapshot;
		const changeLog = trim(prev.changeLog);
		return {
			...prev,
			documentGraph,
			changeLog,
			entryPoint: prev.entryPoint
		};
	}
};
