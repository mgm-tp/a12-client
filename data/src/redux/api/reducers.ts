// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
