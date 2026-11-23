// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useSelector } from "react-redux";

import type {
	Activity,
	DataLoader,
	ApplicationModel,
	View
} from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import type { SampleAppModule } from "../../../utils/SampleAppModule.js";

import appmodel from "./no-model-instance.appmodel.json" with { type: "json" };

class NoModelInstanceDataLoader implements DataLoader<{}> {
	name = "NoModelInstanceDataLoader";

	load() {
		return new Promise<{}>(resolve => {
			setTimeout(() => {
				resolve({ document: "some custom data" });
			}, 2000);
		});
	}

	save() {
		return Promise.reject("Save operation not supported.");
	}

	delete() {
		return Promise.reject("Delete operation not supported.");
	}

	canHandle(descriptor: Activity.Descriptor): boolean {
		return descriptor.feature === "NoModelInstanceDescriptor";
	}
}

const NoModelInstanceModule: SampleAppModule = {
	dataLoaders: [new NoModelInstanceDataLoader()],
	id: "data_handling.no-model-instance",
	model: () => appmodel as ApplicationModel,
	views: () => viewProvider
};

export default NoModelInstanceModule;

function NoModelInstanceView(props: View): JSX.Element | null {
	const data = useSelector(ActivitySelectors.data(props.activityId));

	const loaded = useSelector(ActivitySelectors.loadingStateById(props.activityId)) === "loaded";

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Data loading without model/instance"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<p>
				This example shows how to load data without specifying the model/instance properties in the
				Activity.Descriptor.
			</p>
			<br />
			<br />
			{loaded && <>Loaded data: {JSON.stringify(data)}</>}
		</ActionContentbox>
	);
}

function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent | undefined } = {
	NoModelInstanceView
};
