// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "../../internal/actions.js";

const factory = actionCreatorFactory("Activity");

/**
 * Action to update the attachment thumbnail slice of the default dh.
 *
 * The slice will be lazily created the first time thumbnails are updated.
 *
 * @a12internal
 *
 * **NOTE: Only provided for usage in other A12 products. Because of this,
 * breaking changes to this API can happen at any point!**
 */
export const setThumbnails = factory<SetThumbnailsPayload>("SET_THUMBNAILS");

/**
 * @a12internal
 *
 * **NOTE: Only provided for usage in other A12 products. Because of this,
 * breaking changes to this API can happen at any point!**
 */
export interface SetThumbnailsPayload extends ActivityActions.ActivityActionPayload {
	/**
	 * data structure that maps attachmentId's to their thumbnail url
	 */
	readonly thumbnails: Record<string, string>;
}
