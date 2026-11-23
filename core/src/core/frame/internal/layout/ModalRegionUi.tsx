// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";
import { useCallback, useContext, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { ModalOverlayProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.api.js";

import { ActivityActions } from "../../../activity/index.js";
import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { ViewSelectors } from "../../../view/index.js";

import { DefaultRegionUi } from "./DefaultRegionUi.js";
import type { RegionUiProps } from "./LayoutProps.js";

interface ModalRegionUiProps extends RegionUiProps {
	/**
	 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
	 * Use the {@link ClientWidgetMapContext} instead.
	 */
	readonly widgetMap?: {
		readonly ModalOverlay?: ComponentType<ModalOverlayProps>;
	};
}

/** @internal */
export function ModalRegionUi(props: ModalRegionUiProps): JSX.Element | null {
	const dispatch = useDispatch();
	const region = useSelector(ViewSelectors.region(props.regionReference));

	const { ModalOverlay } = useContext(ClientWidgetMapContext);
	// TODO: Remove with A12-17777
	// oxlint-disable-next-line typescript/no-deprecated
	const ModalComponent = props.widgetMap?.ModalOverlay ?? ModalOverlay;

	const onClose = useCallback(() => {
		dispatch(
			ActivityActions.cancelRequested({
				activityIds: region.views.map(v => v.activityId)
			})
		);
	}, [dispatch, region.views]);

	return region.views.length > 0 ? (
		<ModalComponent closeOnEsc closeOnOutsideClick onClose={onClose}>
			<DefaultRegionUi {...props} />
		</ModalComponent>
	) : null;
}

ModalRegionUi.whyDidYouRender = true;
