// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Selector } from "../../store/index.js";
import { createSliceSelector } from "../../store/internal/selectors.js";
import { isRecord } from "../../utils.js";

function isApplicationSlice(slice: unknown): slice is { readonly busy?: boolean } {
	return isRecord(slice);
}

/**@internal */
export const sliceSelector = createSliceSelector("application", isApplicationSlice);

export namespace ApplicationSelectors {
	/**
	 * Selects the applications busy state
	 */
	export function busy(): Selector<boolean> {
		return state => sliceSelector(state).busy === true;
	}
}
