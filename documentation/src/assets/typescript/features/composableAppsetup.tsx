// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
import type { LocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

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
	combineFeatures(withDirtyHandling, withLocalization),
	// Custom Setup
	combineFeatures(addView("MyView", CustomView), addWrapper(CustomContext))
)(initialConfig);

const { store, initialActions, Component } = createA12ApplicationSetup(finalConfig);

await initialActions();
const root = createRoot(document.getElementById("root")!);
root.render(<Provider store={store}>{Component}</Provider>);
// end::composableAppsetup[]

// tag::clientExtensions[]
combineFeatures(
	withAppModelAdapter,
	withDataServicesConfiguration,
	withDeepLinking,
	withDirtyHandling,
	withLocalization,
	withPlatformModelLoader,
	withNotifications
);
// end::clientExtensions[]
