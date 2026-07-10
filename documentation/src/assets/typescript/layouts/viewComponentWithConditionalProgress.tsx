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

import type { JSX, ReactNode } from "react";
import { Component } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";

function PlaceholderComponent(): JSX.Element {
	return <div>PLACEHOLDER</div>;
}

function shouldRender(): boolean {
	return true;
}

// tag::customFunctional[]
function ConditionalProgressComponent(props: View): JSX.Element {
	const ViewContent = <div>COMPLEX VIEW COMPONENT</div>;

	return props.ProgressComponent && shouldRender() ? (
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
		const ViewContent = <div>COMPLEX VIEW COMPONENT</div>;

		return this.props.ProgressComponent && shouldRender() ? (
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
