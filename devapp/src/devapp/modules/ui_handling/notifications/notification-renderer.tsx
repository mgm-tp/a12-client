// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, JSX } from "react";
import { useContext } from "react";
import { useDispatch } from "react-redux";

import { NotificationActions } from "@com.mgmtp.a12.client/client-core";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { Toast } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast/toast.view.js";

import type { CustomNotification } from "./notification.js";

type NotificationRendererProps = {
	readonly notification: CustomNotification;
};

export function NotificationRenderer(name: string): ComponentType<NotificationRendererProps> {
	if (name === "CustomToast") {
		return (props: NotificationRendererProps) => <CustomToast {...props.notification} />;
	} else {
		throw new Error("unknown notification type " + name);
	}
}

function CustomToast(props: CustomNotification): JSX.Element {
	const dispatch = useDispatch();
	const localizer = useContext(LocalizerContext).localizer;

	return (
		<Toast
			{...props}
			variant={props.severity}
			icon={props.icon ? <Icon>{props.icon}</Icon> : undefined}
			type={props.duration === undefined ? "permanent" : "temporary"}
			header={(props.title && localizer(props.title)) || "No Title Provided"}
			message={
				<>
					{(props.message && localizer(props.message)) || "No Message Provided"} <br />
					<br />
					Activity Id: {props.activityId ?? "None"}, Duration: {props.duration ?? "Permanent"}
					<br />
					Timestamp (custom prop):{" "}
					{props.customTimestamp !== undefined
						? new Date(props.customTimestamp).toISOString()
						: "None"}
				</>
			}
			onClose={() => dispatch(NotificationActions.remove([props.id]))}
		/>
	);
}
