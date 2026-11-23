// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

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
