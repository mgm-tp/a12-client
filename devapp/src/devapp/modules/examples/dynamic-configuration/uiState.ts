// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
