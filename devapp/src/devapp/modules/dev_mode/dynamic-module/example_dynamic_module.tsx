// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements as CBE } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import AppModel from "./example-dynamic-module.appmodel.json" with { type: "json" };

function ExampleDynamicModuleView(): JSX.Element {
	return (
		<ActionContentbox headingElements={<CBE.Title text={"Example Dynamic Module"} />}>
			<p>This is an example for a dynamically added/removed module.</p>
		</ActionContentbox>
	);
}

export const EXAMPLE_DYNAMIC_MODULE: Module = {
	id: "dev-mode.example_dynamic_module",
	model: () => AppModel as ApplicationModel,
	views: () => name => components[name]
};

const components: { [name: string]: View.ViewComponent | undefined } = {
	ExampleDynamicModuleView
};
