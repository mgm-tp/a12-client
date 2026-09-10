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

import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";

import type { Action } from "../Action.js";
import { ActionAssertions } from "../ActionAssertion.js";
import type { ActionSequence } from "../ActionSequence.js";
import { Extractors } from "../dataFromModelSelectors.js";

export const dirtyHandling: ActionSequence = {
	name: "Dirty Handling",
	steps: [
		{
			description: "Open Heterogeneity",
			type: "START_ACTIVITY",
			descriptor: {
				section: "DataHandling",
				feature: "heterogeneity",
				model: "Supertype_Food-document"
			}
		},
		{
			description: "Open document",
			type: "OPEN_DOCUMENT",
			parentModelName: "Supertype_Food-document",
			documentModelName: "SubType_Fruits-document",
			documentIndex: 0,
			test: state => {
				ActionAssertions.openDocument({
					state
				});

				ActionAssertions.documentWithPartialData({
					state,
					expectedResult: "SubType_Fruits-document/1",
					dataEntrySelector: Extractors.extractId
				});

				ActionAssertions.documentWithPartialData({
					state,
					expectedResult: "Fruit1",
					dataEntrySelector: Extractors.extractFieldValue("Name", "root")
				});
			}
		},
		{
			description: "Trigger dirty",
			type: "SET_DIRTY",
			dirty: true
		},
		{
			description: "Cancel",
			type: "CANCEL_REQUESTED_ACTION",
			vetoDialogExpected: true,
			test: assertNumberOfActivities(2)
		},
		{
			description: "Veto",
			type: "RESPONSE_CANCEL_CONFIRMATION_REQUIRED",
			veto: true,
			test: assertNumberOfActivities(2)
		},
		{
			description: "Cancel again",
			type: "CANCEL_REQUESTED_ACTION",
			vetoDialogExpected: true,
			test: assertNumberOfActivities(2)
		},
		{
			description: "No Veto",
			type: "RESPONSE_CANCEL_CONFIRMATION_REQUIRED",
			veto: false,
			test: assertNumberOfActivities(1)
		}
	]
};

function assertNumberOfActivities(expected: number): Action.Base["test"] {
	return state => {
		const actualNumberOfActivities = Object.keys(ActivitySelectors.activities()(state)).length;
		ActionAssertions.deepEqual({
			actual: actualNumberOfActivities,
			expected,
			message: "Wrong number of activities"
		});
	};
}
