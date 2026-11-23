// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type {
	EntityInstancePath,
	FieldInstanceValue
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { DataReference } from "../../core/api/data-reference.js";
import type { KernelTypes } from "../../data-mutation/types.js";
import type { ParseError } from "../../data-mutation/validation-computation/types.js";

// TODO: mutation for validate actions???
const acf = actionCreatorFactory("mutation");

interface AbstractPayload {
	readonly activityId: string;
}

export namespace DataActions {
	export interface PayloadWithDataReference extends AbstractPayload {
		readonly dataReference: DataReference;
	}

	export const changeValue = acf<ChangeValuePayload>("CHANGE_VALUE");

	export interface ChangeValuePayload extends PayloadWithDataReference {
		readonly value: KernelTypes.Value;
		readonly userValue?: string;
	}

	export const parsingFailed = acf<ParsingFailedPayload>("PARSING_FAILED");

	export interface ParsingFailedPayload extends PayloadWithDataReference {
		readonly parseError: ParseError;
	}

	export const rowAdded = acf<RowAddedPayload>("ROW_ADDED");

	export interface RowAddedPayload extends PayloadWithDataReference {
		readonly indexFieldValue?: FieldInstanceValue;
	}

	export const validateFull = acf<ValidateFullPayload>("VALIDATE_FULL");

	export interface ValidateFullPayload extends AbstractPayload {
		// any other parameters required here?
	}

	export const validatePart = acf<ValidatePartPayload>("VALIDATE_PART");

	export interface ValidatePartPayload extends AbstractPayload {
		readonly relevantInstances: EntityInstancePath[];
	}
}
