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

import type { JSX, PropsWithChildren } from "react";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { styled } from "styled-components";

import type { RegionReferenceNG, ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	DynamicRegionUi
} from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

import { setCollapsedAction, uiSlice } from "./uiState.js";

const { Section, Headline, Body } = Typography;

const StyledSection = styled(Section)<{ $color?: string }>`
	border: 1px solid black;
	padding: 10px;
	background-color: ${props => props.$color ?? "white"};
`;

interface DynamicViewProps extends ViewNGProps {
	readonly hideContentbox?: boolean;
	readonly dynamicRegionRef?: RegionReferenceNG;
}

export function DynamicView(props: DynamicViewProps): JSX.Element {
	const activityId = props.activityId;

	const dispatch = useDispatch();

	const cancelActivity = useCallback(() => {
		dispatch(ActivityActions.cancelRequested({ activityIds: [activityId] }));
	}, [dispatch, activityId]);

	const startSubActivity = useCallback(() => {
		dispatch(
			ActivityActions.create({
				activityDescriptor: {
					feature: "dynamicConfiguration",
					shouldShowUpInActivity: activityId
				},
				loadingState: "without",
				initiatingActivityId: activityId
			})
		);
	}, [dispatch, activityId]);

	const uiState = useSelector(uiSlice.selector(activityId));
	const hideSubViews = uiState?.collapsed;
	const toggleHideSubViews = useCallback(() => {
		const collapsed = !hideSubViews;
		dispatch(setCollapsedAction({ activityId, collapsed }));
	}, [dispatch, activityId, hideSubViews]);

	const ViewContainer = props?.hideContentbox ? ViewAsSection : ViewContentBox;

	const numberOfParents = useSelector(
		state => ActivitySelectors.initiatingPath(activityId)(state).length
	);
	const color = numberOfParents % 2 === 0 ? "lightblue" : "lightpink";

	return (
		<ViewContainer onClose={cancelActivity} color={color}>
			<Button label="start sub-activity" primary onClick={startSubActivity} />
			<Button label={`${hideSubViews ? "Show" : "Hide"} sub views`} onClick={toggleHideSubViews} />
			{!hideSubViews && props?.dynamicRegionRef && (
				<SubViews dynamicRegionRef={props.dynamicRegionRef} />
			)}
		</ViewContainer>
	);
}
DynamicView.handleProgressIndicator = true;

interface ViewContainerProps {
	color: string;
	onClose: () => void;
}

function ViewContentBox(props: PropsWithChildren<ViewContainerProps>): JSX.Element {
	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text="Dynamic View" />}
			headingButtons={
				<Button icon={<Icon>close</Icon>} primary destructive onClick={props.onClose} />
			}
		>
			{props.children}
		</ActionContentbox>
	);
}

function ViewAsSection(props: PropsWithChildren<ViewContainerProps>): JSX.Element {
	return (
		<StyledSection $color={props.color}>
			<Headline
				level={1}
				addons={<Button icon={<Icon>close</Icon>} primary destructive onClick={props.onClose} />}
			>
				Dynamic View
			</Headline>
			<Body>{props.children}</Body>
		</StyledSection>
	);
}

function SubViews(props: { dynamicRegionRef: RegionReferenceNG }): JSX.Element {
	return (
		<>
			<Headline level={2}>Sub-Views</Headline>
			<DynamicRegionUi regionRef={props.dynamicRegionRef} />
		</>
	);
}
