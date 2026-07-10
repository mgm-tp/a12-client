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

import { call, type SagaGenerator } from "typed-redux-saga";

import type * as InternalDeepLinkCoder from "./deepLinkCoder.js";
import * as DeepLinkingSagas from "./deepLinkingSagas.js";

export type DeepLinkCoder = InternalDeepLinkCoder.DeepLinkCoder;
export type Configuration = DeepLinkingSagas.Configuration;

/**
 * Provides the application sagas that are necessary for the deep linking functionality
 */
export function createSagas(config: Configuration = {}): (() => SagaGenerator<void>)[] {
	return [
		function* (): SagaGenerator<void> {
			yield* call(DeepLinkingSagas.updateDeepLink, config);
		},
		function* (): SagaGenerator<void> {
			yield* call(DeepLinkingSagas.clearDeepLink, config);
		},
		function* (): SagaGenerator<void> {
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
export function createWelcomePageSaga(config: Configuration = {}): () => SagaGenerator<void> {
	return function* (): SagaGenerator<void> {
		yield* call(DeepLinkingSagas.loadWelcomePage, config);
	};
}
