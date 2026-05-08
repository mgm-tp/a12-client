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

import { ActivitySelectors, NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";

import { ActionAssertions } from "../ActionAssertion.js";
import type { ActionSequence } from "../ActionSequence.js";
import { Extractors } from "../dataFromModelSelectors.js";

export const openNewMultiDashboardOffer: ActionSequence = {
	name: "Open New Multi Dashboard Offer",
	steps: [
		{
			description: "Start multiple activities",
			type: "START_ACTIVITY",
			descriptor: {
				section: "UIHandling",
				feature: "DashboardMultipleActivities"
			},
			actionFinished: state => {
				const lastActivity = ActivitySelectors.latestActivity()(state);
				return (
					lastActivity !== undefined &&
					lastActivity.descriptor.model === "Offer-document" &&
					ActivitySelectors.loadingState(lastActivity).state === "loaded"
				);
			}
		},
		{
			description: "Open new offer document",
			type: "NEW_DOCUMENT",
			modelName: "Offer-document",
			test: state => {
				ActionAssertions.documentWithPartialData({
					state: state,
					expectedResult: NEW_INSTANCE_IDENTIFIER,
					dataEntrySelector: Extractors.extractId
				});
				ActionAssertions.documentWithPartialData({
					state: state,
					expectedResult: null,
					dataEntrySelector: Extractors.extractFieldValue("Id", "Offer")
				});
				ActionAssertions.documentWithPartialData({
					state: state,
					expectedResult: null,
					dataEntrySelector: Extractors.extractFieldValue("Title", "Offer")
				});
			}
		}
	]
};
