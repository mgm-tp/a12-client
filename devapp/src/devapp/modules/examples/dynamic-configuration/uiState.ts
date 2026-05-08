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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { Action } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

import { isRecord } from "../../../utils/types.js";

import type { SliceReducer } from "./createSlice.js";
import { createSlice } from "./createSlice.js";

export interface UIState {
	readonly type: "UIState";
	readonly collapsed: boolean;
	readonly columns: 1 | 2 | 3;
}

export function isUiState(value: unknown): value is UIState {
	return isRecord(value) && value.collapsed !== undefined && value.type === "UIState";
}

export const acf = actionCreatorFactory("examples/asm");

export interface SetCollapsedActionPayload extends ActivityActions.ActivityActionPayload {
	readonly collapsed: boolean;
}

export const setCollapsedAction = acf<SetCollapsedActionPayload>("setCollapsed");

function setCollapsed(
	slice: UIState | undefined,
	action: Action<SetCollapsedActionPayload>
): UIState | undefined {
	const prevState = slice ?? defaultState;
	return { ...prevState, collapsed: action.payload.collapsed };
}

export interface SetColumnsActionPayload extends ActivityActions.ActivityActionPayload {
	readonly columns: 1 | 2 | 3;
}

export const setColumnsAction = acf<SetColumnsActionPayload>("setColumns");

function setColumns(
	slice: UIState | undefined,
	action: Action<SetColumnsActionPayload>
): UIState | undefined {
	const prevState = slice ?? defaultState;
	return { ...prevState, columns: action.payload.columns };
}

export const defaultState: UIState = {
	type: "UIState",
	collapsed: false,
	columns: 1
};

const uiSliceReducer: SliceReducer<UIState> = (_, slice, action) =>
	setCollapsedAction.match(action)
		? setCollapsed(slice, action)
		: setColumnsAction.match(action)
			? setColumns(slice, action)
			: slice;

export const uiSlice = createSlice({
	name: "UIState",
	match: isUiState,
	reduce: uiSliceReducer
});
