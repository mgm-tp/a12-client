// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model } from "@com.mgmtp.a12.client/client-core";
import type { IGeneratedCodeAccessor } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

/* FIXME: should be internal, but is used in uiflows */
export interface ValidatorProviderFactory {
	getValidatorProvider(dm: Model.DocumentAndValidationModel): IGeneratedCodeAccessor;
}

let __instance: ValidatorProviderFactory = {
	getValidatorProvider: dm => dm.generatedCodeAccessor
};

/* FIXME: should be internal, but is used in uiflows */
export namespace ValidatorProviderFactory {
	export function set(factory: ValidatorProviderFactory) {
		__instance = factory;
	}

	export function get() {
		return __instance;
	}
}
