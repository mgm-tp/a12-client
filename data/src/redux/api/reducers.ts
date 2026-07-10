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

import type { ActivityReducers } from "@com.mgmtp.a12.client/client-core";
import type { GeneratedCodeRtConfig } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import {
	handleValidateFull,
	handleValidatePart
} from "../../data-mutation/validation-computation/validation.js";
import { handleChangeValue } from "../../data-mutation/values/handleChangeValue.js";
import { handleParsingFailed } from "../../data-mutation/values/handleParsingFailed.js";
import { handleRowAdded } from "../../data-mutation/values/handleRowAdded.js";
import { assertCondition } from "../../typeguards.js";

import { DataActions } from "./actions.js";
import { isDgClAndValidationDataHolderShape } from "./types.js";

export const dataComponentReducerFactory = (
	kernelOptions?: GeneratedCodeRtConfig
): ActivityReducers.DataReducer => ({
	reduce(dataHolders, action, defaultDataHolder) {
		switch (true) {
			case DataActions.changeValue.match(action): {
				return dataHolders?.map(dh => {
					if (dh === defaultDataHolder) {
						assertCondition(isDgClAndValidationDataHolderShape(dh));
						return handleChangeValue(kernelOptions)(dh, action);
					}
					return dh;
				});
			}
			case DataActions.parsingFailed.match(action): {
				return dataHolders?.map(dh => {
					if (dh === defaultDataHolder) {
						assertCondition(isDgClAndValidationDataHolderShape(dh));
						return handleParsingFailed(kernelOptions)(dh, action);
					}
					return dh;
				});
			}
			case DataActions.rowAdded.match(action): {
				return dataHolders?.map(dh => {
					if (dh === defaultDataHolder) {
						assertCondition(isDgClAndValidationDataHolderShape(dh));
						return handleRowAdded(kernelOptions)(dh, action);
					}
					return dh;
				});
			}
			case DataActions.validateFull.match(action): {
				return dataHolders?.map(dh => {
					if (dh === defaultDataHolder) {
						assertCondition(isDgClAndValidationDataHolderShape(dh));
						return handleValidateFull(kernelOptions)(dh, action);
					}
					return dh;
				});
			}
			case DataActions.validatePart.match(action): {
				return dataHolders?.map(dh => {
					if (dh === defaultDataHolder) {
						assertCondition(isDgClAndValidationDataHolderShape(dh));
						return handleValidatePart(kernelOptions)(dh, action);
					}
					return dh;
				});
			}
			default:
				return dataHolders;
		}
	}
});
