// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";

import { PersonForm } from "../../../mocks/SimpleForm/forms/person-form.js";
import { PersonOverview } from "../../../mocks/SimpleOverview/overviews/person-overview.js";

import { generateComponentDivId } from "./focus.js";
import { FocusHandlingDescription } from "./focusHandlingDescription.js";

export function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const FocusHandlingOverview = addIdWrapper(PersonOverview);
const FocusHandlingForm = addIdWrapper(PersonForm);

/**
 * Wraps the view component with an additional div having an activity specific ID.
 * The ID can later be used to focus the entire view only by knowing the activity ID.
 */
function addIdWrapper(Component: View.ViewComponent): View.ViewComponent {
	return function WrappedComponent(props: View): JSX.Element {
		return (
			<div
				id={generateComponentDivId(props.activityId)}
				tabIndex={-1}
				className={addPrefix("-u-height-full -u-outline-none")}
			>
				<Component {...props} />
			</div>
		);
	};
}
const Views: { [name: string]: View.ViewComponent } = {
	FocusHandlingOverview,
	FocusHandlingForm,
	FocusHandlingDescription
};
