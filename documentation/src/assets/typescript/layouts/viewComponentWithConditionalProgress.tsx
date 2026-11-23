// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, ReactNode } from "react";
import { Component } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";

function PlaceholderComponent(): JSX.Element {
	return <div>PLACEHOLDER</div>;
}

// tag::customFunctional[]
function ConditionalProgressComponent(props: View): JSX.Element {
	const customCondition = true;
	const ViewContent = <div>COMPLEX VIEW COMPONENT</div>;

	return props.ProgressComponent && customCondition ? (
		<props.ProgressComponent activityId={props.activityId}>{ViewContent}</props.ProgressComponent>
	) : (
		ViewContent
	);
}

ConditionalProgressComponent.handleProgressIndicator = true;
// end::customFunctional[]

// tag::customClass[]
class ConditionalProgressComponentClass extends Component<View> {
	static handleProgressIndicator = true;

	render(): ReactNode {
		const customCondition = true;
		const ViewContent = <div>COMPLEX VIEW COMPONENT</div>;

		return this.props.ProgressComponent && customCondition ? (
			<this.props.ProgressComponent activityId={this.props.activityId}>
				{ViewContent}
			</this.props.ProgressComponent>
		) : (
			ViewContent
		);
	}
}
// end::customClass[]

const Views: { [name: string]: View.ViewComponent } = {
	WithConditionalProgress: ConditionalProgressComponent,
	WithConditionalProgressClass: ConditionalProgressComponentClass,
	Placeholder: PlaceholderComponent
};

export function viewProvider(componentName: string): View.ViewComponent {
	return Views[componentName];
}
