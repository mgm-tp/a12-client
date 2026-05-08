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
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../core/api/path/documentPath.js";
import { assertUnreachable } from "../../typeguards.js";

import { adaptIndices } from "./adaptIndices.js";
import { KernelMessage } from "./message.js";
import type { ValidationData, ValidationEntry } from "./types.js";

/**
 * @internal
 *
 * Removes selected messages from a past validation as a pre-processing step
 * before adding new messages.
 *
 * - full validation:
 *      - remove all validation messages except formal errors
 *      - keep all error values
 * - partial validation:
 *      - remove all validation messages except formal errors for relevant fields
 *      - keep all error values
 * - field validation:
 *      - remove all messages for validation relevant fields, notRelevant elements and elements related to removed groups
 *      - remove all error values for validation relevant fields, notRelevant fields and fields from removed groups
 */
export function removeOutdatedMessages(
	validationData: ValidationData,
	type: "field" | "partial" | "full",
	validationRelevantFields?: { [docRef: string]: string[] },
	removedGroupPath?: EntityInstancePath,
	isNotRelevantField?: (path: string) => boolean,
	isComputedField?: (path: EntityInstancePath) => boolean
): ValidationData {
	const result: ValidationData = {};
	const isNonRelevantField = isNotRelevantField ? isNotRelevantField : () => false;
	const isFieldComputed = isComputedField ? isComputedField : () => false;

	Object.entries(validationData).forEach(([docRef, docEntry]) => {
		const filteredMessages = (docEntry?.messages ?? []).filter(msg => {
			if (type === "full") {
				return msg.rulePath === KernelMessage.FORMAL_VALIDATION;
			} else if (type === "partial") {
				return (
					msg.rulePath === KernelMessage.FORMAL_VALIDATION &&
					isMessageConsideredInNextValidation(docRef, msg)
				);
			} else if (type === "field") {
				/**
				 * Remove messages
				 * - for all changed fields
				 *      => these messages are outdated and will be updated in the next validation
				 * - for all non-relevant elements
				 *      => unchanged elements might become non-relevant, so their messages need to be removed
				 * - related to a removed row
				 *      => this includes messages for elements inside of this row as well as messages with index 0 on the same group
				 */
				return (
					!isMessageConsideredInNextValidation(docRef, msg) &&
					!isMessageForNonRelevantField(msg) &&
					!isFormalErrorForComputedField(msg) &&
					!isMessageForRemovedGroup(msg)
				);
			} else {
				assertUnreachable(type, "Unknown validation type encountered");
			}
		});

		const messagesWithAdaptedIndices = filteredMessages.map(msg => updateMessagePaths(msg));

		/**
		 * Remove error values
		 * - for all changed fields
		 *      => these values are outdated and will be updated in the next validation
		 * - for all non-relevant fields (TODO: is this correct? if we don't do this we need to filter the error values before validating)
		 *      => unchanged fields might become non-relevant, so their values need to be removed
		 * - inside if a removed row
		 *
		 * During a partial and full validation all values kept, because the
		 * document hasn't changed.
		 */
		const filteredErrorValues = Object.fromEntries(
			Object.entries(docEntry?.errorValues ?? {}).filter(([docPath]) => {
				if (type === "field") {
					return (
						!arePathsConsideredInNextValidation(docRef, [DocumentPath.fromString(docPath)]) &&
						!isNonRelevantField(docPath) &&
						!isFieldComputed(DocumentPath.fromString(docPath)) &&
						!isPathForRemovedGroup(docPath)
					);
				}

				return true;
			})
		);

		const errorValuesWithAdaptedIndices = updateErrorValuePaths(filteredErrorValues);

		if (Object.keys(errorValuesWithAdaptedIndices).length || messagesWithAdaptedIndices.length) {
			result[docRef] = {
				errorValues: errorValuesWithAdaptedIndices,
				messages: messagesWithAdaptedIndices
			};
		}
	});

	return result;

	function isMessageConsideredInNextValidation(docRef: string, message: Message): boolean {
		return arePathsConsideredInNextValidation(
			docRef,
			KernelMessage.effectiveFieldReferences(message)
		);
	}

	function arePathsConsideredInNextValidation(
		docRef: string,
		paths: EntityInstancePath[]
	): boolean {
		return (
			validationRelevantFields?.[docRef]?.some(relevantField => {
				const relevantFieldPath = DocumentPath.fromString(relevantField);
				return paths.some(p => DocumentPath.containsWith0IndexConsideration(p, relevantFieldPath));
			}) ?? false
		);
	}

	function isMessageForNonRelevantField(message: Message): boolean {
		const refFields = KernelMessage.effectiveFieldReferences(message).map(DocumentPath.toString);
		return refFields.some(isNonRelevantField);
	}

	function isFormalErrorForComputedField(message: Message): boolean {
		return (
			message.rulePath === KernelMessage.FORMAL_VALIDATION &&
			isFieldComputed(message.entityInstance)
		);
	}

	function isMessageForRemovedGroup(message: Message): boolean {
		const refFields = KernelMessage.effectiveFieldReferences(message);

		return (
			removedGroupPath !== undefined &&
			refFields.some(refField => DocumentPath.containsPartially(refField, removedGroupPath))
		);
	}

	function isPathForRemovedGroup(dataRef: string): boolean {
		return (
			removedGroupPath !== undefined &&
			DocumentPath.contains(DocumentPath.fromString(dataRef), removedGroupPath)
		);
	}

	function updateMessagePaths(message: Message): Message {
		return removedGroupPath
			? {
					...message,
					entityInstance: adaptIndices(message.entityInstance, removedGroupPath),
					referencedFields: message.referencedFields.map(refField =>
						adaptIndices(refField, removedGroupPath)
					),
					refOmissionErrorResponsible: message.refOmissionErrorResponsible.map(refField =>
						adaptIndices(refField, removedGroupPath)
					)
				}
			: message;
	}

	function updateErrorValuePaths(errorValues: ValidationEntry["errorValues"]) {
		return removedGroupPath
			? Object.fromEntries(
					Object.entries(errorValues).map(([docPath, value]) => [
						DocumentPath.toString(adaptIndices(DocumentPath.fromString(docPath), removedGroupPath)),
						value
					])
				)
			: errorValues;
	}
}
