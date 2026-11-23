// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useCallback, type JSX } from "react";
import { useDispatch } from "react-redux";

import type { LayoutNG, LayoutPropsNG } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";
import type { Container } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/base-props.js";
import { ModalOverlay } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.view.js";

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
