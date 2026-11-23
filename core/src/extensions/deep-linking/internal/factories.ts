// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// TODO: A12C-3195, SagaIterator to SagaGenerator
// oxlint-disable-next-line no-restricted-imports
import type { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga";

import type * as InternalDeepLinkCoder from "./deepLinkCoder.js";
import * as DeepLinkingSagas from "./deepLinkingSagas.js";

export type DeepLinkCoder = InternalDeepLinkCoder.DeepLinkCoder;
export type Configuration = DeepLinkingSagas.Configuration;

/**
 * Provides the application sagas that are necessary for the deep linking functionality
 */
export function createSagas(config: Configuration = {}): (() => SagaIterator<void>)[] {
	return [
		function* (): SagaIterator<void> {
			yield* call(DeepLinkingSagas.updateDeepLink, config);
		},
		function* (): SagaIterator<void> {
			yield* call(DeepLinkingSagas.clearDeepLink, config);
		},
		function* (): SagaIterator<void> {
			yield* call(DeepLinkingSagas.applyDeepLink, config);
		}
	];
}

/**
 * Provides an application saga that is used to load a welcome page.
 *
 * This function only needs to be called if you do not have deep-linking configured yet
 * in your application. The sagas created by DeepLinkingFactories.createSagas() will load
 * a welcome page automatically if an initial activity is defined in the app model and no
 * deep link is set.
 */
export function createWelcomePageSaga(config: Configuration = {}): () => SagaIterator<void> {
	return function* (): SagaIterator<void> {
		yield* call(DeepLinkingSagas.loadWelcomePage, config);
	};
}
