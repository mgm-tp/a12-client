// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
