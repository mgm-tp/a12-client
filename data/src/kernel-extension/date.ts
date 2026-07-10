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

import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import type {
	DateTimeConversionConfig,
	TimeConversionConfig
} from "@com.mgmtp.a12.utils/utils-localization";

/**
 * Returns the format of the given date (-like) field.
 *
 * Throws if the given element is not a field of type
 * - DateType
 * - DateTimeType
 * - TimeType
 * - DateFragmentType
 * - DateRangeType
 */
export function computeDateTimeFormat(field: DocumentModel.Field): string {
	if (field.fieldType.type === "DateFragmentType") {
		return field.fieldType.formatOfFragment;
	}

	if (field.fieldType.type === "DateRangeType" || field.fieldType.type === "DateType") {
		return field.fieldType.format;
	}

	if (field.fieldType.type === "DateTimeType") {
		// TODO: Remove this workaround after A12K-2913
		return "yyyy-MM-dd'T'HH:mm:ss" satisfies DateTimeConversionConfig["format"];
	}

	if (field.fieldType.type === "TimeType") {
		// TODO: Remove this workaround after A12K-2913
		return "HH:mm:ss" satisfies TimeConversionConfig["format"];
	}

	throw new Error(
		`Cannot get formatString, element ${field.id} is not a DateType/DateFragmentType/DateRangeType/DateTimeType/TimeType field.`
	);
}
