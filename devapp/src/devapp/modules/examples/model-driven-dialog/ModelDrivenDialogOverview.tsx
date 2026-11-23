// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	NEW_INSTANCE_IDENTIFIER
} from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import type { DomainModelDrivenExampleData, PizzaOrder } from "./state.js";

/**
 * Overview of the example, used to open a new dialog and to display the
 * results from the dialog.
 */
export default function ModelDrivenDialogOverview(props: View): JSX.Element {
	const dispatch = useDispatch();
	const data = useSelector(
		ActivitySelectors.data(props.activityId)
	) as DomainModelDrivenExampleData;

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title text="Model-driven Dialogs" ariaLevel={props.ariaLevel} />
			}
		>
			<div>
				<p>
					If you want to create dialogs for other things as your business domain entities, you can
					still benefit from the model driven features of A12.
				</p>
				<p>An example might be a dialog to start some process that requires configuration.</p>
				<p>
					In this example, both the dialog flow and the content of the dialog are modeled using A12
					models. The result of the dialog is simply written into the activity using
					Activity.setData, but you could also trigger any other action to start your custom
					process.
				</p>
				<p>
					<Button
						primary
						onClick={() =>
							dispatch(
								ActivityActions.create({
									initiatingActivityId: props.activityId,
									activityDescriptor: {
										dialog: "example",
										instance: NEW_INSTANCE_IDENTIFIER,
										model: "ModelDrivenDialog-document"
									}
								})
							)
						}
						label="Click here to open the dialog"
					/>
				</p>
			</div>
			{data.pizzaOrder && <LastOrder {...data.pizzaOrder} />}
		</ActionContentbox>
	);
}

function LastOrder(props: PizzaOrder): JSX.Element {
	return (
		<div>
			<p>Last order was: {props.numberOfPizzas + " " + props.pizza + " pizzas"}</p>
		</div>
	);
}
