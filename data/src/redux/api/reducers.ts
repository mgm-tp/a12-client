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

import type { ActivityReducers } from "@com.mgmtp.a12.client/client-core";

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

export const dataComponentReducersFactory = (): ActivityReducers.DataReducer[] => [
	{
		// change field value
		reduce(dataHolders, action, defaultDataHolder) {
			return DataActions.changeValue.match(action)
				? dataHolders?.map(dh => {
						if (dh === defaultDataHolder) {
							assertCondition(isDgClAndValidationDataHolderShape(dh));
							return handleChangeValue()(dh, action);
						}
						return dh;
					})
				: dataHolders;
		}
	},
	{
		// parsing failed
		reduce(dataHolders, action, defaultDataHolder) {
			return DataActions.parsingFailed.match(action)
				? dataHolders?.map(dh => {
						if (dh === defaultDataHolder) {
							assertCondition(isDgClAndValidationDataHolderShape(dh));
							return handleParsingFailed()(dh, action);
						}
						return dh;
					})
				: dataHolders;
		}
	},
	{
		// row added
		reduce(dataHolders, action, defaultDataHolder) {
			return DataActions.rowAdded.match(action)
				? dataHolders?.map(dh => {
						if (dh === defaultDataHolder) {
							assertCondition(isDgClAndValidationDataHolderShape(dh));
							return handleRowAdded()(dh, action);
						}
						return dh;
					})
				: dataHolders;
		}
	},
	{
		// validate full
		reduce(dataHolders, action, defaultDataHolder) {
			return DataActions.validateFull.match(action)
				? dataHolders?.map(dh => {
						if (dh === defaultDataHolder) {
							assertCondition(isDgClAndValidationDataHolderShape(dh));
							return handleValidateFull()(dh, action);
						}
						return dh;
					})
				: dataHolders;
		}
	},
	{
		// validate part
		reduce(dataHolders, action, defaultDataHolder) {
			return DataActions.validatePart.match(action)
				? dataHolders?.map(dh => {
						if (dh === defaultDataHolder) {
							assertCondition(isDgClAndValidationDataHolderShape(dh));
							return handleValidatePart()(dh, action);
						}
						return dh;
					})
				: dataHolders;
		}
	}
];
