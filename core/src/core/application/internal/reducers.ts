// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Reducer } from "redux";
import type { AnyAction } from "typescript-fsa";

import { ApplicationActions } from "./actions.js";

/** @internal */
export interface ApplicationState {
	readonly busy: boolean;
	readonly registeredModules: string[];
}

const defaultApplication: ApplicationState = {
	busy: false,
	registeredModules: []
};

/**
 * The application level reducers
 */
export namespace ApplicationReducers {
	/**
	 * This reducer reduces the application state
	 */
	export const application: Reducer = (
		state: ApplicationState = defaultApplication,
		action: AnyAction
	) => {
		if (ApplicationActions.setBusy.match(action)) {
			return state.busy !== action.payload
				? {
						...state,
						busy: action.payload
					}
				: state;
		} else if (ApplicationActions.addModuleIds.match(action)) {
			return {
				...state,
				registeredModules: state.registeredModules.concat(...action.payload)
			};
		} else if (ApplicationActions.removeModuleIds.match(action)) {
			return {
				...state,
				registeredModules: state.registeredModules.filter(id => !action.payload.includes(id))
			};
		}

		return state;
	};
}
