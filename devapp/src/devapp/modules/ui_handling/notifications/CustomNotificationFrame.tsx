// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useContext, type PropsWithChildren } from "react";

import { ClientWidgetMapContext, NotificationViews } from "@com.mgmtp.a12.client/client-core";
import type { ToastGroupProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast-group.api.js";
import { ToastGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast-group.view.js";

import { NotificationRenderer } from "./notification-renderer.js";

function StackableToasts(props: ToastGroupProps) {
	return <ToastGroup {...props} stackable />;
}

export function CustomNotificationFrame(props: PropsWithChildren) {
	const DefaultWidgetMap = useContext(ClientWidgetMapContext);

	const CustomWidgetMap = {
		...DefaultWidgetMap,
		ToastGroup: StackableToasts
	};

	return (
		<ClientWidgetMapContext.Provider value={CustomWidgetMap}>
			<NotificationViews.Frame notificationRenderer={NotificationRenderer}>
				{props.children}
			</NotificationViews.Frame>
		</ClientWidgetMapContext.Provider>
	);
}
