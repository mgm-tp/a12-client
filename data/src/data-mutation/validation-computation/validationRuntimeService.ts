// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { DocumentRtServiceA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import { DocumentRtServiceFactoryA12internal } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/a12internal/compute.js";
import type {
	GeneratedCodeRtConfig,
	IGeneratedCodeAccessor
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

/* FIXME: should be internal, but is used in uiflows */
export interface DocumentRuntimeServiceFactory {
	createDocumentRtService: (
		generatedCodeAccessor: IGeneratedCodeAccessor,
		config?: GeneratedCodeRtConfig
	) => DocumentRtServiceA12internal;
}

let __instance: DocumentRuntimeServiceFactory = {
	createDocumentRtService: (codeAccessor, config) =>
		DocumentRtServiceFactoryA12internal.createDocumentRtService(codeAccessor, config)
};

/* FIXME: should be internal, but is used in uiflows */
export namespace DocumentRuntimeServiceFactory {
	export function set(factory: DocumentRuntimeServiceFactory) {
		__instance = factory;
	}

	export function get() {
		return __instance;
	}
}
