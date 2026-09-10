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
