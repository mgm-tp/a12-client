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
