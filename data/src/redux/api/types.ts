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
