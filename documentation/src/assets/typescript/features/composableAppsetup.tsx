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

import type { ComponentType, PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import type { Middleware } from "redux";

import type {
	A12ApplicationConfig,
	ApplicationModel,
	BaseConfig,
	FrameViews,
	View
} from "@com.mgmtp.a12.client/client-core";
import {
	addView,
	addWrapper,
	combineFeatures,
	createA12ApplicationSetup,
	withModel
} from "@com.mgmtp.a12.client/client-core";
import { withAppModelAdapter } from "@com.mgmtp.a12.client/client-core/appModelAdapter";
import { withDataServicesConfiguration } from "@com.mgmtp.a12.client/client-core/dataServicesAdapter";
import { withDeepLinking } from "@com.mgmtp.a12.client/client-core/deepLinking";
import { withDirtyHandling } from "@com.mgmtp.a12.client/client-core/dirtyHandling";
import { withLocalization } from "@com.mgmtp.a12.client/client-core/localization";
import { withPlatformModelLoader } from "@com.mgmtp.a12.client/client-core/modelLoader";
import { withNotifications } from "@com.mgmtp.a12.client/client-core/notification";
import type { LocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization";

declare function withFormEngine(_: A12ApplicationConfig): A12ApplicationConfig;
declare function withTreeEngine(_: A12ApplicationConfig): A12ApplicationConfig;
declare const appModel: ApplicationModel;
declare const localizations: LocalizationTreeMap;
declare const CustomView: View.ViewComponent;
declare const CustomContext: ComponentType<PropsWithChildren>;
declare const layoutProvider: (name: string) => FrameViews.Layout;
declare const customMiddleware: Middleware;

// tag::composableAppsetup[]
// the composable appsetup is build on top of the old config, which continues to work
// you can either use it or the more functional setup described below and keep it empty
const clientConfig: BaseConfig = {
	// your reducers, middlewares, sagas, data handlers, etc.
	additionalMiddlewares: [customMiddleware],
	// additionally, view/layout/regionProvider can now be specified here
	// remember to remove any A12 specific components,
	layouts: layoutProvider
};

const initialConfig: A12ApplicationConfig = {
	config: clientConfig,
	localization: {
		supportedLocales: [
			{
				country: "US",
				language: "en",
				name: localizableFromLocalizationTreeMap("languages.english", localizations)
			}
		]
	}
};

const finalConfig = combineFeatures(
	// Engines
	combineFeatures(withFormEngine, withTreeEngine),
	// Model Loading
	combineFeatures(withModel(appModel), withPlatformModelLoader),
	// Client Extensions
	combineFeatures(withLocalization, withDirtyHandling, withNotifications),
	// Custom Setup
	combineFeatures(addView("MyView", CustomView), addWrapper(CustomContext))
)(initialConfig);

const { store, initialActions, Component } = createA12ApplicationSetup(finalConfig);

await initialActions();
const root = createRoot(document.getElementById("root") as HTMLDivElement);
root.render(<Provider store={store}>{Component}</Provider>);
// end::composableAppsetup[]

// tag::clientExtensions[]
combineFeatures(
	withLocalization,
	withAppModelAdapter,
	withDataServicesConfiguration,
	withDeepLinking,
	withDirtyHandling,
	withPlatformModelLoader,
	withNotifications
);
// end::clientExtensions[]
