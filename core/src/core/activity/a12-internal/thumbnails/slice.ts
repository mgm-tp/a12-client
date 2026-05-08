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

import type {
	LoadThumbnailUrlsJsonRpc2,
	ThumbnailUrl
} from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Attachment/attachment.js";

import type { Modifier } from "../../../lenses.js";
import type { Activity } from "../../internal/activity.js";

/**
 * Name of the slice that will be added to the default DH when thumbnails are cached
 *
 * @a12internal
 *
 * **NOTE: Only provided for usage in other A12 products. Because of this,
 * breaking changes to this API can happen at any point!**
 */
export const THUMBNAIL_SLICE = "thumbnails";

/**
 * @internal
 */
export function updateThumbnailSlice(
	thumbSlice: Record<string, string> = {}
): Modifier<Activity.DataHolder> {
	return dataHolder => ({
		...dataHolder,
		slices: {
			...dataHolder.slices,
			[THUMBNAIL_SLICE]: {
				...dataHolder.slices[THUMBNAIL_SLICE],
				...thumbSlice
			}
		}
	});
}

/**
 * The nested structure of the server response is not needed for the slice and
 * is simplified here.
 *
 * The server maps documentId -> attachmentId -> thumbnailUrl objects
 *
 * For lookup during rendering, we only need attachmentId -> actual thumbnail url string
 *
 * @a12internal
 *
 * **NOTE: Only provided for usage in other A12 products. Because of this,
 * breaking changes to this API can happen at any point!**
 */
export function convertThumbnailResponse(
	thumbnails: LoadThumbnailUrlsJsonRpc2.Response
): Record<string, string> {
	// result maps a documentId to a thumbnail map
	const thumbnailMaps = Object.values(thumbnails.result);

	return thumbnailMaps.reduce(
		(thumbSlice, thumbnailMap) => {
			// a thumbnail map maps an attachmentId to an object containing small and big thumbnails
			const thumbnails = flattenThumbnailMap(thumbnailMap);
			return {
				...thumbSlice,
				...thumbnails
			};
		},
		{} as Record<string, string>
	);
}

/**
 * Simplifies a thumbnail mapping to a simple object mapping attachmentIds to their thumbnail url
 */
function flattenThumbnailMap(thumbnailMap: Record<string, ThumbnailUrl>): Record<string, string> {
	return Object.fromEntries(
		Object.entries(thumbnailMap).map(([id, url]) =>
			url.bigThumbnailUrl ? [id, url.bigThumbnailUrl] : []
		)
	);
}
