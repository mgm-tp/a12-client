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

import type { ComponentType, FC, FunctionComponent, ReactNode } from "react";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivitySelectors, ViewViews } from "@com.mgmtp.a12.client/client-core";
import {
	type Container,
	ActionContentbox,
	ContentBoxElements,
	type ButtonGroupContainerProps,
	ButtonGroupContainer
} from "@com.mgmtp.a12.widgets/widgets-core";

import { assert } from "../utils/types.js";

import { isSingleDocumentData } from "./SimpleForm/data.js";

declare const __PROFILE__: string;

export function withActivityContext<P extends ViewNGProps>(
	Component: ComponentType<P> | FunctionComponent<P>,
	dataPredicate: (data: unknown) => boolean = isSingleDocumentData
): FC<P> {
	return props => {
		const dataExistsAndMatches = useSelector(state => {
			const data = ActivitySelectors.activityPropById(
				props.activityId,
				a => Activity.findDefaultDataHolder(a)?.data
			)(state);

			return Object.keys(data ?? {}).length > 0 && dataPredicate(data);
		});
		const ctx = useMemo(() => ({ activityId: props.activityId }), [props.activityId]);

		return dataExistsAndMatches ? (
			<ViewViews.ActivityContext.Provider value={ctx}>
				<Component {...props} />
			</ViewViews.ActivityContext.Provider>
		) : null;
	};
}

export function useActivityId(): string {
	const activityId = useContext(ViewViews.ActivityContext)?.activityId;
	if (activityId === undefined) {
		throw new Error("Activity id not found");
	}
	return activityId;
}

export function useDefaultDataHolder(): Activity.DataHolder {
	const activityId = useActivityId();
	const activity = useSelector(ActivitySelectors.activityById(activityId));

	return useMemo(() => {
		assert(activity !== undefined, "Activity not found");

		const dataHolder = Activity.findDefaultDataHolder(activity);
		assert(dataHolder !== undefined, "Data holder not found");

		return dataHolder;
	}, [activity]);
}

export interface EngineFrameProps extends Container, ViewNGProps {
	readonly padding?: boolean;
	readonly title?: string;
	readonly headingButtons?: ReactNode;
	readonly subActionBar?: ReactNode;
	readonly footer?: {
		readonly leftButtons?: ButtonGroupContainerProps.ButtonProps[];
		readonly rightButtons?: ButtonGroupContainerProps.ButtonProps[];
	};
	readonly type: "Overview" | "Form";
}

export function EngineFrame(props: EngineFrameProps) {
	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<>
					<ContentBoxElements.Title ariaLevel={2} text={props.title} />
					<ContentBoxElements.Subtitle
						ariaLevel={2}
						text={`This is NOT an official A12 ${props.type} Engine, just a placeholder.`}
					/>
				</>
			}
			headingButtons={props.headingButtons}
			subActionBar={props.subActionBar}
			footer={
				props.footer?.leftButtons || props.footer?.rightButtons ? (
					<ContentBoxElements.Footer>
						<ButtonGroupContainer
							responsive
							leftSlotButtons={props.footer.leftButtons}
							rightSlotButtons={props.footer.rightButtons}
						/>
					</ContentBoxElements.Footer>
				) : null
			}
			padding={props.padding ? "24px" : false}
		>
			{props.children}
		</ActionContentbox>
	);
}

export function isPlatformServerProfile(): boolean {
	return typeof __PROFILE__ === "string" && __PROFILE__ === "platform";
}
