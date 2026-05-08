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

import type { Activity } from "@com.mgmtp.a12.client/client-core";

import { activityReplacementDocument } from "./ActivityReplacementMocks.js";
import { BookAuthorMocks } from "./BookAuthorMocks.js";
import { fruitDocument } from "./FoodMocks.js";
import { mobileNavigationDocument } from "./MobileNavigationMocks.js";
import { offerDocument } from "./OfferMocks.js";
import { personDocument } from "./PersonMocks.js";

export function documentProvider(id: string): Activity.Data.Document {
	if (id.startsWith("Offer-document/")) {
		return offerDocument(Number(id.substring("Offer-document/".length)));
	} else if (id.startsWith("Person-document/")) {
		return personDocument(Number(id.substring("Person-document/".length)));
	} else if (id.startsWith("BookAuthor-document")) {
		const authorDoc = BookAuthorMocks.find(doc => doc.id === id);
		if (authorDoc) {
			return authorDoc;
		}
	} else if (id.startsWith("MobileNavigation-document/")) {
		return mobileNavigationDocument(Number(id.substring("MobileNavigation-document/".length)));
	} else if (id.startsWith("SubType_Fruits-document/")) {
		return fruitDocument(Number(id.substring("SubType_Fruits-document/".length)));
	} else if (id.startsWith("ActivityReplacement-document/")) {
		return activityReplacementDocument(
			Number(id.substring("ActivityReplacement-document/".length))
		);
	}
	throw new Error("no mocks for " + id);
}

const DOCUMENT_INDICES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function documentsProvider(modelName: string): Activity.Data.Document[] {
	if ("Offer-document" === modelName) {
		return DOCUMENT_INDICES.map(offerDocument);
	} else if ("Person-document" === modelName) {
		return DOCUMENT_INDICES.map(personDocument);
	} else if ("BookAuthor-document" === modelName) {
		return BookAuthorMocks;
	} else if ("MobileNavigation-document" === modelName) {
		return DOCUMENT_INDICES.map(mobileNavigationDocument);
	} else if ("Supertype_Food-document" === modelName) {
		return DOCUMENT_INDICES.map(fruitDocument);
	} else if ("ActivityReplacement-document" === modelName) {
		return DOCUMENT_INDICES.map(activityReplacementDocument);
	} else {
		throw new Error("Unknown document for model: " + modelName);
	}
}
