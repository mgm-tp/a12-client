// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

export interface Food {
	readonly Name: string;
	readonly Consumption: string;
	readonly NutritionInfo: {
		Calories: number;
		Fat: number;
		Proteins: number;
		Carbohydrates: number;
	};
}

export interface HealthyFood {
	readonly Benefits: "1" | "2" | "3" | null;
	readonly Name: string;
	readonly Food: Food;
}

export interface Vegetable {
	readonly Food: HealthyFood;
	readonly Name: string;
	readonly WaterContent: number;
}

export interface Fruits {
	readonly Name: string;
	readonly Sugar: number;
	readonly Food: HealthyFood;
	readonly CookingSuggestions: { value: "key1" | "key2" }[];
}

export interface UnhealthyFood {
	readonly Food: Food;
	readonly Disadvantages: { value: "key1" | "key2" }[];
	readonly Occasions: { value: "key1" | "key2" }[];
	readonly Name: string;
}

export interface FastFood {
	readonly Food: UnhealthyFood;
	readonly Name: string;
}
