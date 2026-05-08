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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
	// eslint-disable-next-line @typescript-eslint/no-deprecated
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
