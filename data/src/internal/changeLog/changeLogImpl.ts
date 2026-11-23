// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Change, ChangeLog, DocumentChange, LinkChange, Marker } from "./changeLog.js";

// These "reducer helpers" work in on the ChangeLogSlice structure of an Activity's DataHolder

/**
 * @internal
 *
 * Puts the given `changes` into the `changeLog`. It uses internal compaction logic to prevent
 * the change log to grow too large.
 */
export function applyChanges<S>(changeLog: ChangeLog<S>, changes: Change<S>[]): ChangeLog<S> {
	if (changes.length === 0) {
		return changeLog;
	} else if (isChangeCollapsingAllowed()) {
		// Skip the first change of given changes, and apply same optimization on the rest of changes.
		// The change counter has to be increased anyway, otherwise the changes might not be propagated
		const updatedChangeLog = applyChanges(changeLog, changes.slice(1));
		return {
			...updatedChangeLog,
			changeCounter: updatedChangeLog.changeCounter + Math.max(changes.length - 1, 1)
		};
	} else {
		return {
			...changeLog,
			changes: [...changeLog.changes, ...changes],
			changeCounter: changeLog.changeCounter + changes.length
		};
	}

	// Internal optimization
	// Currently only checks if the new change and last logged change are both DocChanges on the same doc
	function isChangeCollapsingAllowed(): boolean {
		const len = changeLog.changes.length;
		const firstNewChange = changes[0];
		if (firstNewChange.kind === "docChanged" && len > 0) {
			const lastLoggedChange = changeLog.changes[len - 1];
			if (
				lastLoggedChange.kind === "docChanged" &&
				lastLoggedChange.docRef === firstNewChange.docRef
			) {
				return true;
			}
		}
		return false;
	}
}

const INITIAL_CHANGE_NUMBER = 0;

/** @internal */
export function newChangeLog<S>(): ChangeLog<S> {
	return {
		changes: [],
		changeCounter: INITIAL_CHANGE_NUMBER
	};
}

/** @internal */
export function changeCounter<S>(changeLog: ChangeLog<S> | undefined): number {
	return changeLog?.changeCounter ?? INITIAL_CHANGE_NUMBER - 1;
}

/** @internal */
export function isLinkRelatedChange<S>(change: Change<S>): change is LinkChange {
	return ["linkAdded", "linkDeleted", "linkDocChanged"].some(kind => kind === change.kind);
}

/** @internal */
export function isDocumentRelatedChange<S>(change: Change<S>): change is DocumentChange {
	return ["docChanged", "docAdded"].some(kind => kind === change.kind);
}

/**
 * @internal
 *
 * Remove the (last) marker with the given ID. If no such marker exists, the
 * state remains unchanged.
 */
export function clearMarker<S>(changeLog: ChangeLog<S>): ChangeLog<S> {
	const markerIndex = findMarkerIndex(changeLog.changes);
	if (markerIndex < 0) {
		return changeLog;
	}
	return {
		...changeLog,
		changes: changeLog.changes.filter((_c, i) => i !== markerIndex)
	};
}

/**
 * @internal
 *
 * Cut off all changes beginning with the marker with the given ID. If no such
 * marker exists, the state remains unchanged.
 */
export function trim<S>(changeLog: ChangeLog<S>): ChangeLog<S> {
	const markerIndex = findMarkerIndex(changeLog.changes);
	if (markerIndex < 0) {
		return changeLog;
	}
	return {
		...changeLog,
		changes: changeLog.changes.slice(0, markerIndex),
		changeCounter: changeLog.changeCounter + 1
	};
}

/**
 * @internal
 *
 * Return the (last) index of the marker with the given ID. If no such marker
 * exists, return undefined.
 */
export function findMarker<S>(changeLog: ChangeLog<S>, id?: string): Marker<S> | undefined {
	const markerIndex = findMarkerIndex(changeLog.changes, id);
	if (markerIndex < 0) {
		return undefined;
	}
	return changeLog.changes[markerIndex] as Marker<S>;
}

/**
 * Find the last index of a marker, optionally with the given ID.
 *
 * Search all changes in reverse order. If an ID was given and matches the ID of
 * a marker => hit. If no ID was given => match any marker.
 */
function findMarkerIndex(changes: Change<unknown>[], id?: string): number {
	for (let i = changes.length - 1; i >= 0; i--) {
		const change = changes[i];
		const idMatch = change.kind === "marker" && id !== undefined && change.id === id;
		const typeMatch = change.kind === "marker" && id === undefined;
		if (idMatch || typeMatch) {
			return i;
		}
	}
	return -1;
}
