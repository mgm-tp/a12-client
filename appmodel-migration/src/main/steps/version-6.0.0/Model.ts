// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

export namespace Model {
	/**
	 * A descriptor for a model.
	 *
	 * This can be used in the application model to specify which kind of
	 * models should be loaded for various scenes.
	 */
	export interface Descriptor<T extends string = string> {
		/** The type of the model. */
		readonly modelType: T;

		/** The name for the descriptor. */
		readonly name: string;

		/**
		 * The name of the document model used for heterogeneity
		 */
		readonly documentModel?: string;

		readonly [key: string]: string | undefined;
	}
}
