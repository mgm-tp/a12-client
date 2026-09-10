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

import type {
	DocumentModel,
	DocumentModelSearchService,
	DocumentService
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

/* FIXME: should be internal, but is used in uiflows */
export interface DocServiceFactory {
	getDocumentService: () => DocumentService;
	getDocumentModelSearchService: (dm: DocumentModel) => DocumentModelSearchService;
}

// Store the last requested DM name and DM search service to make use of its internal caching
let __dmName: string | undefined = undefined;
let __searchService: DocumentModelSearchService | undefined = undefined;

let __instance: DocServiceFactory = {
	getDocumentService: () => new DocumentServiceFactory().getDocumentService(),
	getDocumentModelSearchService: dm => {
		if (__dmName !== undefined && __dmName === dm.header.id && __searchService) {
			return __searchService;
		} else {
			__dmName = dm.header.id;
			__searchService = new DocumentServiceFactory().getDocumentModelSearchService(dm);
			return __searchService;
		}
	}
};

/* FIXME: should be internal, but is used in uiflows */
export namespace DocServiceFactory {
	export function set(factory: DocServiceFactory) {
		__instance = factory;
	}

	export function get() {
		return __instance;
	}
}
