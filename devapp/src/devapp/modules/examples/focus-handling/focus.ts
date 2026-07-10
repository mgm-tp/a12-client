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

import type { SagaGenerator } from "typed-redux-saga";
import { select } from "typed-redux-saga";

import { ActivitySelectors, NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";

import { isDocumentListData } from "../../../mocks/SimpleOverview/data.js";
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
		} else if (isDocumentListData(data)) {
			const index = data.documents.findIndex(d => d.id === instance);
			const listOfRows = viewComponent.querySelectorAll<HTMLElement>(
				`[data-role='table-body-row']`
			);
			const isRowContainedInElement = listOfRows.length > index;
			if (isRowContainedInElement) {
				listOfRows.item(index).focus();
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
