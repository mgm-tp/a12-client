// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useContext, type JSX } from "react";
import { useDispatch } from "react-redux";

import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";

import { ActivityActions } from "../../../../activity/index.js";
import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import type { View } from "../../../../view/index.js";

/** @internal */
export function ErrorBoundaryFallbackComponent(
	props: View.ErrorBoundaryProvider.FallbackComponentProps
): JSX.Element {
	const dispatch = useDispatch();
	const { componentStack, error, ariaLevel, activityId } = props;

	const { TextOutput, Label, ActionContentbox, ContentBoxTitle, ContentBoxCloseButton } =
		useContext(ClientWidgetMapContext);

	return (
		<ActionContentbox
			padding="24px"
			headingElements={
				<>
					<ContentBoxTitle key="title" text="Oops! An error occurred!" ariaLevel={ariaLevel} />
					<ContentBoxCloseButton
						primary
						destructive
						onClick={() => dispatch(ActivityActions.cancel({ activityId }))}
					/>
				</>
			}
		>
			<Label label={error.toString()} className={addPrefix("-u-margin-b-sm")} />
			<TextOutput className={addPrefix("-u-margin-l-sm")} label="Stacktrace">
				{componentStack
					.split("\n")
					.filter(component => component)
					.map((component, index) => (
						<div key={index}>{component}</div>
					))}
			</TextOutput>
		</ActionContentbox>
	);
}
