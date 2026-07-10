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

import type { Action } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import type {
	Activity,
	ActivityActions,
	ActivityReducers
} from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

export type SliceReducer<Shape> = (
	dh: Activity.DataHolder,
	slice: Shape | undefined,
	action: Action<ActivityActions.DataReducerActionPayload>
) => Shape | undefined;

type SliceMatch<Shape> = (o: unknown) => o is Shape;

interface CreateSliceArgs<Shape> {
	name: string;
	match: SliceMatch<Shape>;
	reduce: SliceReducer<Shape>;
}

export interface Slice<Shape> {
	dataReducer: ActivityReducers.DataReducer;
	selector: (activityId: string) => (state: object) => Shape | undefined;
}

/**
 * TODO: Add "create data holder" to create something similar but for a whole
 * data holder. And then allow to combine both.
 *
 * Convenience function to create a data reducer and selector for a single data
 * holder slice. Currently, only the default data holder can be reduced.
 *
 * Inspired by react toolkit.
 *
 * We should consider providing something like this in C.
 *
 * You pass in the name of the slice, a type guard function, and a reducer for
 * the slice.
 *
 * If the slice is not present, undefined is passed.
 *
 * In order to ignore any action, return the input unchanged.
 *
 * In order to delete the slice, return undefined.
 */
export function createSlice<Shape extends {}>(args: CreateSliceArgs<Shape>): Slice<Shape> {
	const selector: Slice<Shape>["selector"] = activityId => state => {
		const activity = ActivitySelectors.activityById(activityId)(state);
		const uiState = activity
			? ActivitySelectors.dataHolderByDescriptor(activity.id, activity.descriptor)(state)?.slices[
					args.name
				]
			: undefined;
		return uiState && args.match(uiState) ? uiState : undefined;
	};

	// TODO: split code
	const dataReducer: ActivityReducers.DataReducer = {
		reduce(dataHolders, action, defaultDh) {
			const replaceSlice: (
				newSlice: Shape | undefined
			) => (dh: Activity.DataHolder) => Activity.DataHolder = newSlice => dh =>
				dh === defaultDh
					? {
							...dh,
							slices: {
								...dh.slices,
								[args.name]: newSlice
							}
						}
					: dh;

			const slice = defaultDh?.slices[args.name];
			if (slice === undefined || args.match(slice)) {
				const newSlice = defaultDh ? args.reduce(defaultDh, slice, action) : slice;
				return newSlice !== slice ? dataHolders.map(replaceSlice(newSlice)) : dataHolders;
			} else {
				return dataHolders;
			}
		}
	};

	return {
		dataReducer,
		selector
	};
}
