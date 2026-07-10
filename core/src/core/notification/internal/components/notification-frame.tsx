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

import type { ComponentType, JSX, ReactNode } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { isOnSmallDevice } from "../../../view/internal/size-context.js";

import { NotificationActions } from "../actions.js";
import type { Notification } from "../notification.js";
import { NotificationSelectors } from "../selectors.js";

import ToastMapper from "./toast.js";

/** @internal */
export function NotificationFrame(props: {
	children?: ReactNode;
	notificationRenderer?(name: string): ComponentType<{
		notification: Notification;
	}>;
}): JSX.Element {
	const dispatch = useDispatch();
	const currentSize = useContext(SizeContext).currentSize;

	const { ToastGroup } = useContext(ClientWidgetMapContext);

	const notifications = useSelector(NotificationSelectors.notifications());

	const notificationElements: JSX.Element[] = [];

	if (notifications.length > 0) {
		if (isOnSmallDevice(currentSize)) {
			notificationElements.push(
				<ToastGroup
					mobile
					key="mobile"
					closeOnEsc
					onClose={() => {
						const id = [notifications[notifications.length - 1].id];
						dispatch(NotificationActions.remove(id));
					}}
				>
					<NotificationToast
						{...notifications[notifications.length - 1]}
						customRenderer={props.notificationRenderer}
					/>
				</ToastGroup>
			);
		} else {
			const ordered = groupNotifications(notifications);
			for (const position of positions) {
				if (ordered[position].length > 0) {
					notificationElements.push(
						<ToastGroup
							position={position}
							key={position}
							onClose={() => {
								const ids = ordered[position].map(notification => notification.id);
								dispatch(NotificationActions.remove(ids));
							}}
						>
							{ordered[position].map(notification => (
								<NotificationToast
									key={notification.id}
									{...notification}
									customRenderer={props.notificationRenderer}
								/>
							))}
						</ToastGroup>
					);
				}
			}
		}
	}

	return (
		<div>
			{props.children}
			{notificationElements}
		</div>
	);
}

interface NotificationToastProps extends Notification {
	customRenderer?(name: string): ComponentType<{
		notification: Notification;
	}>;
}

/** @internal */
function NotificationToast({
	customRenderer,
	...props
}: NotificationToastProps): JSX.Element | null {
	if (props.componentId !== undefined && customRenderer !== undefined) {
		const View = customRenderer(props.componentId);

		return <View notification={props} key={props.id} />;
	} else {
		return <ToastMapper {...props} key={props.id} />;
	}
}

function groupNotifications(notifications: Notification[]): OrderedNotifications {
	return notifications.reduce<OrderedNotifications>(
		(result, notification) => ({
			...result,
			[notification.position ?? "top-right"]: [
				...result[notification.position ?? "top-right"],
				notification
			]
		}),
		{
			"top-right": [],
			"top-left": [],
			"bottom-right": [],
			"bottom-left": []
		}
	);
}

interface OrderedNotifications {
	"top-right": Notification[];
	"top-left": Notification[];
	"bottom-right": Notification[];
	"bottom-left": Notification[];
}

const positions = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;
