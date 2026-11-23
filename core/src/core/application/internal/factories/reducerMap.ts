// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Reducer } from "redux";

/**
 * Reserved slice names for internal use only.
 */
export interface InternalSlices {
	readonly activities: Reducer;
	readonly locale: Reducer;
	readonly models: Reducer;
	readonly application: Reducer;
	readonly notifications: Reducer;
}

export interface Slices {
	readonly [slice: string]: Reducer | undefined;
}

/** @internal */
export interface InternalReducerMap extends Slices, InternalSlices {}

/**
 * A map for additional reducers. All properties with the type `never` are
 * reserved for internal use. It is not possible to customize them by replacing
 * the reducer.
 */
export type ReducerMap = Slices & {
	[S in keyof InternalSlices]?: never;
};
