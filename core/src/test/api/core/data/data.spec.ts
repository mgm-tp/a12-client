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

import { strictEqual } from "node:assert/strict";

import type { Activity } from "../../../../core/activity/index.js";
import { DataLoader } from "../../../../core/data/index.js";
import { ApplicationModel } from "../../../../core/model/index.js";

describe("core.data", () => {
	describe("DataLoader.canHandle", () => {
		const modelKeyExistsCondition: ApplicationModel.MatchCondition.Existence = {
			key: "model",
			isSet: true
		};
		const modelEqualOfferCondition: ApplicationModel.MatchCondition.Equality = {
			key: "model",
			mustEqual: "Offer"
		};
		const pageKeyNotExistsCondition: ApplicationModel.MatchCondition.Existence = {
			key: "page",
			isSet: false
		};
		const pageKeyExistsCondition: ApplicationModel.MatchCondition.Existence = {
			key: "page",
			isSet: true
		};
		const pageEqualStaticCondition: ApplicationModel.MatchCondition.Equality = {
			key: "page",
			mustEqual: "static"
		};

		function setupDescriptor(model: string, page?: string): Activity.Descriptor {
			return {
				model,
				page
			};
		}

		function setupMeta(matchConditions: ApplicationModel.MatchCondition[]): DataLoader.Meta {
			return {
				name: "mock",
				matchConditions
			};
		}

		describe("Given an activity descriptor with a defined model property", () => {
			const descriptor = setupDescriptor("Offer");

			describe("and a dataloader without matching condition", () => {
				const meta = setupMeta([]);
				it("returns true", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), true);
				});
			});

			describe("and a dataloader matching if a model is defined", () => {
				const meta = setupMeta([modelKeyExistsCondition]);
				it("returns true", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), true);
				});
			});

			describe("and a dataloader matching if a model is defined and another key doesn't exist", () => {
				const meta = setupMeta([modelKeyExistsCondition, pageKeyNotExistsCondition]);
				it("returns true", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), true);
				});
			});

			describe("and a dataloader matching if the model has the given name", () => {
				const meta = setupMeta([modelEqualOfferCondition]);
				it("returns true", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), true);
				});
			});

			describe("and a dataloader matching if the model has the given name and another key is equal to another value", () => {
				const meta = setupMeta([modelEqualOfferCondition, pageEqualStaticCondition]);
				it("returns false", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), false);
				});
			});
		});

		describe("given a descriptor with a model name and an additional key/value pair", () => {
			const descriptor = setupDescriptor("Offer", "static");
			describe("and a dataloader matching if a model is defined", () => {
				const meta = setupMeta([modelKeyExistsCondition]);
				it("returns true", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), true);
				});
			});

			describe("and a dataloader matching if a model is defined and the given additional key exists", () => {
				const meta = setupMeta([modelKeyExistsCondition, pageKeyExistsCondition]);
				it("returns true", () => {
					strictEqual(DataLoader.canHandle(meta, descriptor), true);
				});
			});

			describe(
				"and a dataloader matching if the model has the given name " +
					"and the given additional key has the given value",
				() => {
					const meta = setupMeta([modelEqualOfferCondition]);
					it("returns true", () => {
						strictEqual(DataLoader.canHandle(meta, descriptor), true);
					});
				}
			);

			describe(
				"and a dataloader matching if the model has the given name, " +
					"but the given additional key is not defined",
				() => {
					const meta = setupMeta([modelEqualOfferCondition, pageKeyNotExistsCondition]);
					it("returns false", () => {
						strictEqual(DataLoader.canHandle(meta, descriptor), false);
					});
				}
			);
		});

		describe("given any activity descriptor", () => {
			const descriptor = setupDescriptor("OfferXXX");

			describe("and a dataloader matching a condition other than value or existence of a key", () => {
				// this is a fake state matcher which does not exist in the client
				const anyMatchCondition: any = { key: "length", count: 10 };

				it("returns true", () => {
					strictEqual(
						ApplicationModel.MatchCondition.evaluate(anyMatchCondition, descriptor),
						true
					);
				});
			});
		});
	});
});
