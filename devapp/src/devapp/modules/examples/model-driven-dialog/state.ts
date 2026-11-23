// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * Structure of Activity.Data used in this example - as we directly use
 * A12 documents, this has to match the A12 document model.
 */
export interface DomainModelDrivenExampleData {
	pizzaOrder?: PizzaOrder;
}

export interface PizzaOrder {
	readonly pizza: string;
	readonly numberOfPizzas: number;
}
