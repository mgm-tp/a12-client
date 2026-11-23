// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./errorBoundaries.appmodel.json" with { type: "json" };
import { ErrorBoundaries } from "./ErrorBoundaries.js";

const ErrorBoundariesModule: SampleAppModule = {
	id: "error_handling.error-boundaries",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default ErrorBoundariesModule;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

function EngineWithError(): JSX.Element {
	throw new Error(
		"I crash when someone tries to render me. :( But I am helpful to demonstrate the use of error boundaries."
	);
}

const Views: { [name: string]: View.ViewComponent } = {
	ErrorBoundaries,
	EngineWithError
};
