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

import { useCallback, useContext, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ActivityActions } from "../../../activity/index.js";
import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { ViewSelectors } from "../../../view/index.js";

import { DefaultRegionUi } from "./DefaultRegionUi.js";
import type { RegionUiProps } from "./LayoutProps.js";

/** @internal */
export function ModalRegionUi(props: RegionUiProps): JSX.Element | null {
	const dispatch = useDispatch();
	const region = useSelector(ViewSelectors.region(props.regionReference));

	const { ModalOverlay } = useContext(ClientWidgetMapContext);

	const onClose = useCallback(() => {
		dispatch(
			ActivityActions.cancelRequested({
				activityIds: region.views.map(v => v.activityId)
			})
		);
	}, [dispatch, region.views]);

	return region.views.length > 0 ? (
		<ModalOverlay closeOnEsc closeOnOutsideClick onClose={onClose}>
			<DefaultRegionUi {...props} />
		</ModalOverlay>
	) : null;
}

ModalRegionUi.whyDidYouRender = true;
