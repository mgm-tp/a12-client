// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Action } from "typescript-fsa";

import type { Activity } from "@com.mgmtp.a12.client/client-core";

import type { ValidationDataHolderShape } from "../../data-mutation/validation-computation/types.js";
import { isSetValidation } from "../../data-mutation/validation-computation/types.js";
import type { DgChangeLogSlice, DgSlice } from "../../internal/slices.js";
import { isRecord } from "../../typeguards.js";

export type DgClAndValidationDataHolderShape = DgClDataHolderShape & ValidationDataHolderShape;

export type ReducerSignature<T> = (
	dataHolder: DgClAndValidationDataHolderShape,
	action: Action<T>
) => DgClAndValidationDataHolderShape;

export function isDgClAndValidationDataHolderShape(
	dataHolder: Activity.DataHolder<unknown>
): dataHolder is DgClAndValidationDataHolderShape {
	return (
		dataHolder.data !== undefined && isSetDgCl(dataHolder.data) && isSetValidation(dataHolder.data)
	);
}

export type DgClDataHolderShape = Activity.DataHolder<DgSlice & DgChangeLogSlice>;

/* FIXME: should be internal, but is used in uiflows */
export function isSetDgCl(data: unknown): data is DgSlice & DgChangeLogSlice {
	return isRecord(data) && data.documentGraph !== undefined && data.changeLog !== undefined;
}
