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

import type { Animation, SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core";

import { isOnSmallDevice } from "../../../view/internal/size-context.js";

const LEFT_TO_RIGHT_ANIMATION: Animation = { animateSingleItem: "ltr" };
const RIGHT_TO_LEFT_ANIMATION: Animation = { animateSingleItem: "rtl" };

/**
 * @internal
 * The animation direction shall only change if the view stack changes.
 * In all other case the direction of the last stack change shall be used.
 * This makes the animation more robust when having several render calls in close succession.
 */
export function getAnimation(
	previousViewsLength: number,
	viewsLength: number,
	currentSize: SizeDetectorProps.Size | undefined
): Animation | undefined {
	if (!isOnSmallDevice(currentSize) || previousViewsLength === 0) {
		return undefined;
	}
	if (previousViewsLength < viewsLength) {
		return RIGHT_TO_LEFT_ANIMATION;
	}
	if (previousViewsLength > viewsLength) {
		return LEFT_TO_RIGHT_ANIMATION;
	}
	return undefined;
}
