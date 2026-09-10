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

import type { Module, View } from "@com.mgmtp.a12.client/client-core";

import { SimpleFormDataLoader } from "./data-loader.js";
import { OfferForm } from "./forms/offer-form.js";
import { PersonForm } from "./forms/person-form.js";
import { SimpleFormSagas } from "./sagas.js";

export * as SimpleFormActions from "./actions.js";
export { SingleDocumentData } from "./data.js";
export * from "./inputs/index.js";
export { SimpleForm } from "./view.js";

export namespace SimpleFormFactories {
	export const DataLoader = SimpleFormDataLoader;
	export const createSagas = () => SimpleFormSagas;

	export function createModule(): Module {
		return {
			id: "SimpleFormModule",
			sagas: createSagas,
			views: () => componentName => Views[componentName]
		};
	}
}

const Views: { [name: string]: View.ViewComponent | undefined } = {
	PersonForm,
	OfferForm
};
