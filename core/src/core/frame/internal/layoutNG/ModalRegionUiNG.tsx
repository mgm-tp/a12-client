// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";
import { useCallback, useContext, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { ModalOverlayProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.api.js";

import { ActivityActions } from "../../../activity/index.js";
import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { DynamicModelSelectors } from "../../../configurationNG/internal/dynamicSelectors.js";

import { DynamicRegionUi } from "./DynamicRegionUi.js";
import type { RegionUiPropsNG } from "./layoutPropsNG.js";
import { ROOT_REGION_REF } from "./layoutPropsNG.js";

/**
 * @experimental
 */
export interface ModalRegionUiNGProps extends RegionUiPropsNG {
	/**
	 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
	 * Use the {@link ClientWidgetMapContext} instead.
	 */
	readonly widgetMap?: {
		readonly ModalOverlay?: ComponentType<ModalOverlayProps>;
	};
}

/**
 * @experimental
 *
 * A wrapper around the dynamic default region that renders the views inside a modal
 *
 * NOTE: Not passing a `regionRef` is considered the entry point,
 * aka the "root region". This should only happen once in your application.
 */
export function ModalRegionUiNG(props: ModalRegionUiNGProps): JSX.Element | null {
	const regionRef = props.regionRef ?? ROOT_REGION_REF;
	const dispatch = useDispatch();
	const region = useSelector(DynamicModelSelectors.dynamicRegionInfo(regionRef));

	const { ModalOverlay } = useContext(ClientWidgetMapContext);
	// TODO: Remove with A12-17777
	// oxlint-disable-next-line typescript/no-deprecated
	const ModalComponent = props.widgetMap?.ModalOverlay ?? ModalOverlay;

	const onClose = useCallback(() => {
		dispatch(
			ActivityActions.cancelRequested({
				activityIds: region.views.map(v => v.props.activityId)
			})
		);
	}, [dispatch, region.views]);

	return region.views.length > 0 ? (
		<ModalComponent closeOnEsc closeOnOutsideClick onClose={onClose}>
			<DynamicRegionUi {...props} />
		</ModalComponent>
	) : null;
}

ModalRegionUiNG.whyDidYouRender = true;
