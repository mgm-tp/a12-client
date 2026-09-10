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

import type { Activity } from "@com.mgmtp.a12.client/client-core";
import type { Message } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../core/api/path/documentPath.js";
import { isRecord } from "../../typeguards.js";

import { KernelMessage } from "./message.js";

export type ValidationDataHolderShape = Activity.DataHolder<ValidationSlice>;

export function isSetValidation(data: unknown): data is ValidationSlice {
	return isRecord(data) && data.validation !== undefined;
}

export interface ValidationSlice {
	readonly validation: ValidationData;
}

export type ValidationData = Record<string, ValidationEntry | undefined>;
export interface ValidationEntry {
	readonly messages: Message[];
	readonly errorValues: { [docPath: string]: string };
}

export interface ParseError {
	readonly message: Message;
	readonly value: string;
}

export namespace ValidationData {
	/** Adds the new parse error and removes an old parse error for the same field if it exists */
	export function addParseError(
		data: ValidationData,
		docRef: string,
		parseError: ParseError
	): ValidationData {
		const currentMessages = data[docRef]?.messages ?? [];
		const idxOfCurrentParseError = currentMessages.findIndex(
			msg =>
				msg.rulePath === KernelMessage.FORMAL_VALIDATION &&
				DocumentPath.equal(msg.entityInstance, parseError.message.entityInstance)
		);
		const currentMessagesWithoutParseError =
			idxOfCurrentParseError > -1
				? currentMessages.filter((_, idx) => idx !== idxOfCurrentParseError)
				: currentMessages;

		return {
			...data,
			[docRef]: {
				messages: [...currentMessagesWithoutParseError, parseError.message],
				errorValues: {
					...(data[docRef]?.errorValues ?? {}),
					[DocumentPath.toString(parseError.message.entityInstance)]: parseError.value
				}
			}
		};
	}

	/*
		TODO: This would not be necessary if we would ensure that the map of error values stays
		reference-equal if there are no changes. Then we could simply compare them with '==='.

		Note: The error values are currently seen as an extension of the document. For a future
		improvement the error values and the corresponding formal errors could be moved to the
		document. So that every field in the document contains either a value or a formal error
		(with the respective error value).
		This would simplify the updates of the validation state in case of formal errors and would
		couple the field instance and the formal error more explicitly.
		We wouldn't need an "extension" of the document anymore. Changes to the "error values"
		could be expressed via change paths/objects like it is already done for the real document
		at the moment.
	*/
	/**
	 * Checks whether the error values for the given docRef are deep equal in both
	 * given validation states.
	 */
	export function areErrorValuesEqualForDocument(
		docRef: string,
		vd1: ValidationData,
		vd2: ValidationData
	): boolean {
		const ev1 = vd1[docRef]?.errorValues ?? {};
		const ev2 = vd2[docRef]?.errorValues ?? {};

		if (Object.keys(ev1).length !== Object.keys(ev2).length) {
			return false;
		}

		return Object.entries(ev1).every(
			([dataRef, value]) => ev2?.[dataRef] !== undefined && ev2[dataRef] === value
		);
	}
}
