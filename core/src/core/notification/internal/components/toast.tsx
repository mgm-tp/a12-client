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
import { useContext } from "react";
import { useDispatch } from "react-redux";

import type { Localizable } from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import type { ToastProps } from "@com.mgmtp.a12.widgets/widgets-core";

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
