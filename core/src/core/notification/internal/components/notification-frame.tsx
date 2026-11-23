// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, JSX, ReactNode } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";

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
