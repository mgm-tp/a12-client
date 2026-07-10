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

import { useCallback, type JSX } from "react";
import { useDispatch } from "react-redux";

import type { LayoutNG, LayoutPropsNG } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";
import { type Container, ModalOverlay } from "@com.mgmtp.a12.widgets/widgets-core";

/**
 * This is an example of an alternative modal implementation using a layout
 * instead of a region.
 *
 * Note: It should not be used inside the default Modal Region, because that
 * provides its own modal overlay. See general.devapp.tsx for an example
 * region configuration.
 *
 * You can also wrap views in progress and/or error boundary components (not
 * shown here).
 */
function ModalRegionLayout(props: LayoutPropsNG): JSX.Element {
	return (
		<>
			{props.views.map(view => {
				const activityId = view.props.activityId;
				return (
					<Modal key={activityId} activityId={activityId} {...view.constraints}>
						<view.Component {...view.props} ariaLevel={1} />
					</Modal>
				);
			})}
		</>
	);
}

/**
 * Typings for layout constraints - the layout supports to set a fixed size and
 * a fullscreen mode.
 */
interface ModalProps extends Container {
	readonly activityId: string;
	readonly width?: number;
	readonly height?: number;
	readonly fullscreen?: boolean;
}

/**
 * Utility wrapper that omits the wrapper div in fullscreen mode, because it
 * interferes with it.
 */
function Modal(props: ModalProps): JSX.Element {
	const dispatch = useDispatch();
	const onClose = useCallback(() => {
		dispatch(ActivityActions.cancelRequested({ activityIds: [props.activityId] }));
	}, [dispatch, props.activityId]);

	const content = props.fullscreen ? (
		<>{props.children}</>
	) : (
		<div style={{ width: props.width, height: props.height }}>{props.children}</div>
	);

	return (
		<ModalOverlay
			closeOnEsc
			closeOnOutsideClick
			onClose={onClose}
			fullscreen={props.fullscreen}
			noGutter={!props.fullscreen}
		>
			{content}
		</ModalOverlay>
	);
}

export const CustomModalLayout: LayoutNG = {
	component: ModalRegionLayout
};
