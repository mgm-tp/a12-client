// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
