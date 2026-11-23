// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";

export type SampleError =
	| SampleError.SubsystemNotAvailable
	| SampleError.ValidationError
	| SampleError.NotAuthorizedError
	| SampleError.NullError;

export type SampleApplicationError = Activity.Error<SampleError>;

export namespace SampleError {
	export interface SubsystemNotAvailable extends Activity.Error.Http {
		readonly errorCode: "SAMPLE_SUBSYSTEM_NOT_AVAILABLE";
		readonly subsystem: string;
	}

	export interface ValidationError extends Activity.Error.Base {
		readonly errorCode: "SAMPLE_VALIDATION_ERROR";
		readonly message: string;
		readonly errors: ValidationErrorInfo[];
	}

	export interface ValidationErrorInfo {
		readonly fieldName: string;
		readonly message: string;
	}

	export interface NotAuthorizedError extends Activity.Error.Http {
		readonly errorCode: "SAMPLE_NOT_AUTHORIZED_ERROR";
	}

	export interface NullError {
		readonly errorCode: "NULL_ERROR";
	}
}
