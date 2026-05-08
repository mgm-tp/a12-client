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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { Module, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import appmodel from "./multipleModels.appmodel.json" with { type: "json" };

const MultipleModelsModule: Module = {
	id: "examples.multiple-models",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default MultipleModelsModule;

function MultipleModelsFeature(props: View) {
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Load additional document models"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<h3>Scene with four document models</h3>
			<p>
				This example demonstrates how to load additional document models into the Redux store by
				declaring them in the application model.
			</p>
			<pre>{MODELS}</pre>
			<p>
				We want to load several document models into the Redux store whenever a scene gets entered.
				These additional document models could be used for some application specific pre- or
				post-processing. Have a look at the models slice in the store to see that the declared
				models have been loaded.
			</p>
			<br />
			<p>
				<b>Note:</b> The activity descriptor must contain model and instance properties, because the
				loading of models is only done along with data loading. If the given instance is not
				available, an exception might be thrown, but the models are loaded anyway.
			</p>
		</ActionContentbox>
	);
}

const MODELS = `sceneChange: {
  onEnter: [
    {
      type: "VIEW_ADD",
      name: "MyComponent",
      models: [
        { modelType: "document", name: "Book-document" },
        { modelType: "document", name: "BookAuthor-document" }
  ]`;

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	MultipleModelsFeature
};
