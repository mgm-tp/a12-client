// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { select } from "typed-redux-saga";

import { ActivitySelectors, NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";

import { DocumentListData } from "../../../mocks/SimpleOverview/data.js";
import { assert } from "../../../utils/types.js";

export function generateComponentDivId(activityId: string): string {
	return `view-${activityId}`;
}

export function* focus(activityId: string, instance?: string): SagaGenerator<void> {
	const data = yield* select(ActivitySelectors.data(activityId));

	/**
	 * React needs to update the DOM before we can reference its elements. We wait for this update by observing the DOM.
	 * The observation will end after the first update.
	 */
	const observer = new MutationObserver(() => {
		observer.disconnect();

		// the view components of this module have been wrapped in the component provider with a div having exactly this ID
		const viewComponent = document.getElementById(generateComponentDivId(activityId));
		if (viewComponent === null) {
			return;
		}

		if (instance === undefined) {
			viewComponent.focus();
		} else if (instance === NEW_INSTANCE_IDENTIFIER) {
			/**
			 * Focus the add button in the overview.
			 * If your models are structured differently, you should adapt this part.
			 */
			const button = viewComponent.querySelector<HTMLElement>("[data-role='button']");
			assert(button);
			button.focus();
		} else if (DocumentListData.isInstance(data)) {
			const index = data.documents.findIndex(d => d?.id === instance);
			const row = viewComponent.querySelectorAll<HTMLElement>(`[data-role='table-body-row']`)[
				index
			];
			if (row) {
				row.focus();
			} else {
				/*
				 * The row may not exist on the current page, e.g. when creating a new document in mock mode
				 */
				viewComponent.focus();
			}
		}
	});

	observer.observe(document, {
		subtree: true,
		childList: true,
		attributes: true
	});
}
