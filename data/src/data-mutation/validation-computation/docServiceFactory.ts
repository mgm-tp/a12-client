// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
