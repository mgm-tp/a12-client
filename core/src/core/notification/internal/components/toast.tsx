// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext } from "react";
import { useDispatch } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import type { Localizable } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/Localizable.js";
import type { ToastProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/toast/main/toast/toast.api.js";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";

import { NotificationActions } from "../actions.js";

interface ToastMapperProps {
	readonly id: string | number;
	readonly message?: Localizable;
	readonly view?: string;
	readonly title?: Localizable;
	readonly severity?: "info" | "success" | "warning" | "error";
	readonly duration?: number;
	readonly icon?: string;
}

export default function ToastMapper(props: ToastMapperProps): JSX.Element {
	const dispatch = useDispatch();
	const localizer = useContext(LocalizerContext).localizer;

	const { Toast, Icon } = useContext(ClientWidgetMapContext);

	const mappedProps: ToastProps = {
		type: props.duration === undefined ? "permanent" : "temporary",
		variant: props.severity,
		duration: props.duration,
		message: props.message ? localizer(props.message) : "",
		header: props.title ? localizer(props.title) : "",
		icon: props.icon ? <Icon>{props.icon}</Icon> : undefined,
		onClose: () => dispatch(NotificationActions.remove([props.id]))
	};
	return <Toast {...mappedProps} />;
}
