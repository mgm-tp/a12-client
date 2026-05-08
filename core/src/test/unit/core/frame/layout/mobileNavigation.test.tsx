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

import { deepStrictEqual, fail, notStrictEqual, strictEqual } from "node:assert/strict";

import {
	MobileNavigationAction,
	type ViewWithRegionReference
} from "../../../../../core/frame/internal/layout/mobile-navigation.js";
import { ApplicationModel } from "../../../../../core/model/index.js";
import type { View } from "../../../../../core/view/index.js";

describe("core.frame.internal.layout", () => {
	describe("MobileNavigation", () => {
		const viewInformationContent = {
			regionReference: ["CONTENT"],
			type: "VIEW_ADD" as const,
			name: "CONTENT"
		};

		const viewInformationSidebar = {
			regionReference: ["SIDEBAR"],
			type: "VIEW_ADD" as const,
			name: "SIDEBAR"
		};

		function assertCancelResult(result: MobileNavigationAction | undefined, ids: string[]): void {
			notStrictEqual(result, undefined);

			if (result && result.type === "CancelActivity") {
				deepStrictEqual(result.activitiesToCancel, ids);
			} else {
				fail("Expected to get a CancelActivity action");
			}
		}

		function assertSwitchRegion(
			result: MobileNavigationAction | undefined,
			regionRef: ApplicationModel.Region.Reference
		): void {
			notStrictEqual(result, undefined);

			if (result && result.type === "RegionSwitch") {
				strictEqual(
					ApplicationModel.Region.Reference.equal(result.switchToRegion, regionRef),
					true
				);
			} else {
				fail("Expected to get a RegionSwitch action");
			}
		}

		describe("Given the case that the content is currently visible", () => {
			const visibleRegion = ["CONTENT"];

			describe("and there are no further views which are not visible due to a clear", () => {
				describe("and the layout shows all matching views", () => {
					describe("and there is no view in the sidebar", () => {
						// e.g. Dashboard with no sidebar
						it("returns undefined", () => {
							const view1 = { name: "View1", activityId: "A" };
							const view1Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view1
							};

							const view2 = { name: "View2", activityId: "B" };
							const view2Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view2
							};
							const result = MobileNavigationAction.calculate({
								activityIdMap: { A: undefined, B: undefined },
								listOfViews: [view1Info, view2Info],
								regionInformation: [
									{
										regionReference: ["SIDEBAR"],
										views: [],
										clearedAfter: undefined
									},
									{
										regionReference: ["CONTENT"],
										views: [view1, view2]
									}
								],
								visibleRegion
							});

							strictEqual(result, undefined);
						});
					});

					describe("and there is a view in the sidebar", () => {
						describe("which belongs to an activity which has the same id then one of the currently visible views", () => {
							// e.g. Dashboard with a sidebar which belongs to a tile
							it("returns a RegionSwitch with switch to 'SIDEBAR' ", () => {
								const view1 = { name: "View1", activityId: "A" };
								const view1Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view1
								};

								const view2 = { name: "View2", activityId: "B" };
								const view2Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view2
								};

								const view3 = {
									name: "View-Sidebar",
									activityId: "A"
								};
								const view3Info = { ...viewInformationSidebar, ...view3 };

								const result = MobileNavigationAction.calculate({
									activityIdMap: { A: undefined, B: undefined },
									listOfViews: [view1Info, view2Info, view3Info],
									regionInformation: [
										{
											regionReference: ["SIDEBAR"],
											views: [view3],
											clearedAfter: undefined
										},
										{
											regionReference: ["CONTENT"],
											views: [view1, view2]
										}
									],
									visibleRegion
								});

								assertSwitchRegion(result, ["SIDEBAR"]);
							});
						});

						describe(
							"which does not belong to an activity " +
								" which has the same id then one of the currently visible views",
							() => {
								// e.g. Dashboard with a sidebar which belongs to the parent activity
								it("shows a content back-button which cancels all activities belonging to the currently visible views", () => {
									const view1 = {
										name: "View-Sidebar",
										activityId: "A"
									};
									const view1Info = { ...viewInformationSidebar, ...view1 };

									const view2 = { name: "View1", activityId: "B" };
									const view2Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view2
									};

									const view3 = { name: "View2", activityId: "C" };
									const view3Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view3
									};

									const result = MobileNavigationAction.calculate({
										activityIdMap: { A: undefined, B: undefined, C: undefined },
										listOfViews: [view1Info, view2Info, view3Info],
										regionInformation: [
											{
												regionReference: ["SIDEBAR"],
												views: [view1]
											},
											{
												regionReference: ["CONTENT"],
												views: [view2, view3]
											}
										],
										visibleRegion
									});
									assertCancelResult(result, ["B", "C"]);
								});
							}
						);
					});

					describe("and there are two views in the content region which where added after each other", () => {
						it("returns a cancel action for the activity of the last added view", () => {
							const view1 = { name: "View-Sidebar", activityId: "A" };
							const view1Info = { ...viewInformationSidebar, ...view1 };

							const view2 = { name: "View1", activityId: "B" };
							const view2Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view2
							};

							const result = MobileNavigationAction.calculate({
								activityIdMap: { A: undefined, B: "A" },
								listOfViews: [view1Info, view2Info],
								regionInformation: [
									{
										regionReference: ["SIDEBAR"],
										views: []
									},
									{
										regionReference: ["CONTENT"],
										views: [view1, view2]
									}
								],
								visibleRegion
							});
							assertCancelResult(result, ["B"]);
						});
					});
				});
			});

			describe("and the layout does not show all matching views", () => {
				describe("and there is no view in the sidebar", () => {
					// e.g. OV-Engine and Form in MasterDetail
					it("shows a content back-button, which cancels the activities belonging to the visible views", () => {
						const view1 = { name: "View1", activityId: "A" };
						const view1Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view1
						};

						const view2 = { name: "View2", activityId: "B" };
						const view2Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view2
						};

						const view3 = { name: "View3", activityId: "C" };
						const view3Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view3
						};

						const result = MobileNavigationAction.calculate({
							activityIdMap: { A: undefined, B: undefined, C: undefined },
							listOfViews: [view1Info, view2Info, view3Info],
							regionInformation: [
								{
									regionReference: ["SIDEBAR"],
									views: []
								},
								{
									regionReference: ["CONTENT"],
									views: [view1, view2, view3],
									clearedAfter: 1
								}
							],
							visibleRegion
						});
						assertCancelResult(result, ["C"]);
					});
				});

				describe("and there is a view in the sidebar", () => {
					describe("which belongs to an activity which has the same id then one of the currently visible views", () => {
						// e.g. OV-Engine which opens a Form with a Sidebar [OV-E] [Form, SB]
						it("shows a content back-button which expands the sidebar", () => {
							const view1 = { name: "View1", activityId: "A" };
							const view1Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view1
							};

							const view2 = { name: "View2", activityId: "B" };
							const view2Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view2
							};

							const view3 = { name: "View-Sidebar", activityId: "B" };
							const view3Info: ViewWithRegionReference = {
								...viewInformationSidebar,
								...view3
							};

							const result = MobileNavigationAction.calculate({
								activityIdMap: { A: undefined, B: undefined, C: undefined },
								listOfViews: [view1Info, view2Info, view3Info],
								regionInformation: [
									{
										regionReference: ["SIDEBAR"],
										views: [view3]
									},
									{
										regionReference: ["CONTENT"],
										views: [view1, view2]
									}
								],
								visibleRegion
							});

							assertSwitchRegion(result, ["SIDEBAR"]);
						});
					});

					describe(
						"which does not belong to an activity " +
							" which has the same id then one of the currently visible views",
						() => {
							// e.g. Ov-Engine with sidebar and Form [Ov-E, SB] [Form]
							it("shows a content back-button which cancels all activities belonging to the currently visible views", () => {
								const view1 = { name: "View1", activityId: "A" };
								const view1Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view1
								};

								const view2 = { name: "View2", activityId: "B" };
								const view2Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view2
								};

								const view3 = {
									name: "View-SIDEBAR",
									activityId: "A"
								};
								const view3Info: ViewWithRegionReference = {
									...viewInformationSidebar,
									...view3
								};

								const result = MobileNavigationAction.calculate({
									activityIdMap: { A: undefined, B: "A" },
									listOfViews: [view1Info, view2Info, view3Info],
									regionInformation: [
										{
											regionReference: ["SIDEBAR"],
											views: [view3]
										},
										{
											regionReference: ["CONTENT"],
											views: [view1, view2]
										}
									],
									visibleRegion
								});

								assertCancelResult(result, ["B"]);
							});
						}
					);
				});
			});

			describe("and there are further views which are not visible due to a clear", () => {
				describe("and the layout shows all matching views", () => {
					describe("and there is no view in the sidebar", () => {
						// e.g. Ov-Engine and FOrm with a clear in between
						it(
							"does show a content back-button which " +
								"cancels the activities belonging to the currently visible views",
							() => {
								const view1 = { name: "View1", activityId: "A" };
								const view1Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view1
								};

								const view2 = { name: "View2", activityId: "B" };
								const view2Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view2
								};

								const view3 = { name: "View3", activityId: "C" };
								const view3Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view3
								};

								const result = MobileNavigationAction.calculate({
									activityIdMap: { A: undefined, B: undefined, C: undefined },
									listOfViews: [view1Info, view2Info, view3Info],
									regionInformation: [
										{
											regionReference: ["SIDEBAR"],
											views: [view3]
										},
										{
											regionReference: ["CONTENT"],
											views: [view2, view3]
										}
									],
									visibleRegion
								});

								assertCancelResult(result, ["B", "C"]);
							}
						);

						it("and container activities", () => {
							const view1 = { name: "View1", activityId: "A" };
							const view1Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view1
							};

							const view3 = { name: "View3", activityId: "C" };
							const view3Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view3
							};

							const view4 = { name: "View4", activityId: "D" };
							const view4Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view4
							};

							const result = MobileNavigationAction.calculate({
								activityIdMap: { A: undefined, B: undefined, C: undefined },
								listOfViews: [view1Info, view3Info, view4Info],
								regionInformation: [
									{
										regionReference: ["SIDEBAR"],
										views: []
									},
									{
										regionReference: ["CONTENT"],
										views: [view3, view4]
									}
								],
								visibleRegion
							});

							assertCancelResult(result, ["B", "C", "D"]);
						});
					});

					describe("and there is a view in the sidebar", () => {
						describe("which belongs to an activity which has the same id then one of the currently visible views", () => {
							it("shows a content back-button which expands the sidebar", () => {
								const view1: View = {
									name: "View1",
									activityId: "A"
								};
								const view1Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view1
								};

								const view2 = { name: "View2", activityId: "B" };
								const view2Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view2
								};

								const view3 = { name: "View3", activityId: "C" };
								const view3Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view3
								};

								const view4 = {
									name: "View-Sidebar",
									activityId: "B"
								};
								const view4Info: ViewWithRegionReference = {
									...viewInformationSidebar,
									...view4
								};

								const result = MobileNavigationAction.calculate({
									activityIdMap: { A: undefined, B: undefined, C: undefined },
									listOfViews: [view1Info, view2Info, view3Info, view4Info],
									regionInformation: [
										{
											regionReference: ["SIDEBAR"],
											views: [view4]
										},
										{
											regionReference: ["CONTENT"],
											views: [view2, view3]
										}
									],
									visibleRegion
								});

								assertSwitchRegion(result, ["SIDEBAR"]);
							});
						});

						describe(
							"which does not belong to an activity " +
								" which has the same id then one of the currently visible views",
							() => {
								it("shows a content back-button which cancels all activities belonging to the currently visible views", () => {
									const view1 = { name: "View1", activityId: "A" };
									const view1Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view1
									};

									const view2 = { name: "View2", activityId: "B" };
									const view2Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view2
									};

									const view3 = { name: "View3", activityId: "C" };
									const view3Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view3
									};

									const view4 = {
										name: "View-Sidebar",
										activityId: "A"
									};
									const view4Info: ViewWithRegionReference = {
										...viewInformationSidebar,
										...view4
									};

									const result = MobileNavigationAction.calculate({
										activityIdMap: { A: undefined, B: undefined, C: undefined },
										listOfViews: [view1Info, view2Info, view3Info, view4Info],
										regionInformation: [
											{
												regionReference: ["SIDEBAR"],
												views: [view4]
											},
											{
												regionReference: ["CONTENT"],
												views: [view2, view3]
											}
										],
										visibleRegion
									});
									assertCancelResult(result, ["B", "C"]);
								});
							}
						);
					});
				});

				describe("and the layout does not show all matching views", () => {
					describe("and there is no view in the sidebar", () => {
						it("shows a content back-button, which cancels the activities belonging to the visible views", () => {
							const view1 = { name: "View1", activityId: "A" };
							const view1Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view1
							};

							const view2 = { name: "View2", activityId: "B" };
							const view2Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view2
							};

							const view3 = { name: "View3", activityId: "C" };
							const view3Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view3
							};

							const view4 = { name: "View4", activityId: "D" };
							const view4Info: ViewWithRegionReference = {
								...viewInformationContent,
								...view4
							};

							const result = MobileNavigationAction.calculate({
								activityIdMap: { A: undefined, B: undefined, C: undefined, D: undefined },
								listOfViews: [view1Info, view2Info, view3Info, view4Info],
								regionInformation: [
									{
										regionReference: ["SIDEBAR"],
										views: []
									},
									{
										regionReference: ["CONTENT"],
										views: [view2, view3, view4],
										clearedAfter: 0
									}
								],
								visibleRegion
							});
							assertCancelResult(result, ["C", "D"]);
						});
					});

					describe("and there is a view in the sidebar", () => {
						describe("which belongs to an activity which has the same id then one of the currently visible views", () => {
							// e.g. OV-does which opens a Form and Sidebar with a clear in between [OV-E] [Clear] [SB, Form]
							it("shows a content back-button which expands the sidebar", () => {
								const view1 = { name: "View1", activityId: "A" };
								const view1Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view1
								};

								const view2 = { name: "View2", activityId: "B" };
								const view2Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view2
								};

								const view3 = {
									name: "View-Sidebar",
									activityId: "C"
								};
								const view3Info: ViewWithRegionReference = {
									...viewInformationSidebar,
									...view3
								};

								const view4 = { name: "View4", activityId: "C" };
								const view4Info: ViewWithRegionReference = {
									...viewInformationContent,
									...view4
								};

								const result = MobileNavigationAction.calculate({
									activityIdMap: { A: undefined, B: undefined, C: undefined },
									listOfViews: [view1Info, view2Info, view3Info, view4Info],
									regionInformation: [
										{
											regionReference: ["SIDEBAR"],
											views: [view3]
										},
										{
											regionReference: ["CONTENT"],
											views: [view2, view4]
										}
									],
									visibleRegion
								});
								assertSwitchRegion(result, ["SIDEBAR"]);
							});
						});

						describe(
							"which does not belong to an activity " +
								" which has the same id then one of the currently visible views",
							() => {
								// e.g. Ov-Engine with sidebar and Form [SB, OV-E] [Clear] [Form]
								it("shows a content back-button which cancels all activities belonging to the currently visible views", () => {
									const view1 = { name: "View1", activityId: "A" };
									const view1Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view1
									};

									const view2 = { name: "View2", activityId: "B" };
									const view2Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view2
									};

									const view3 = {
										name: "View-Sidebar",
										activityId: "A"
									};
									const view3Info: ViewWithRegionReference = {
										...viewInformationSidebar,
										...view3
									};

									const view4 = { name: "View4", activityId: "C" };
									const view4Info: ViewWithRegionReference = {
										...viewInformationContent,
										...view4
									};

									const result = MobileNavigationAction.calculate({
										activityIdMap: { A: undefined, B: undefined, C: undefined },
										listOfViews: [view1Info, view2Info, view3Info, view4Info],
										regionInformation: [
											{
												regionReference: ["SIDEBAR"],
												views: [view3]
											},
											{
												regionReference: ["CONTENT"],
												views: [view2, view4],
												clearedAfter: 0
											}
										],
										visibleRegion
									});
									assertCancelResult(result, ["C"]);
								});
							}
						);
					});
				});
			});
		});

		describe("Given the case that the sidebar is currently visible", () => {
			const visibleRegion = ["SIDEBAR"];
			describe("and there a no views which are not visible due to a clear", () => {
				describe("and the content layout would show all matching views", () => {
					it("does not show back-button if the activities are not related", () => {
						const view1 = { name: "View1", activityId: "A" };
						const view1Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view1
						};

						const view2 = { name: "View2", activityId: "B" };
						const view2Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view2
						};

						const view3 = { name: "View-Sidebar", activityId: "A" };
						const view3Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view3
						};

						const result = MobileNavigationAction.calculate({
							activityIdMap: { A: undefined, B: undefined, C: undefined },
							listOfViews: [view1Info, view2Info, view3Info],
							regionInformation: [
								{
									regionReference: ["SIDEBAR"],
									views: [view3]
								},
								{
									regionReference: ["CONTENT"],
									views: [view2, view1]
								}
							],
							visibleRegion
						});

						strictEqual(result, undefined);
					});

					it("shows a back-button which cancels the current views if the activities are related", () => {
						const view1 = { name: "View1", activityId: "A" };
						const view1Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view1
						};

						const view2 = { name: "View2", activityId: "B" };
						const view2Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view2
						};

						const view3 = { name: "View-Sidebar", activityId: "C" };
						const view3Info: ViewWithRegionReference = {
							...viewInformationSidebar,
							...view3
						};

						const result = MobileNavigationAction.calculate({
							activityIdMap: { A: undefined, B: "A", C: "A" },
							listOfViews: [view1Info, view2Info, view3Info],
							regionInformation: [
								{
									regionReference: ["SIDEBAR"],
									views: [view3]
								},
								{
									regionReference: ["CONTENT"],
									views: [view2, view1]
								}
							],
							visibleRegion
						});

						assertCancelResult(result, ["C", "B"]);
					});
				});

				describe("and the content layout does not show all matching views", () => {
					// e.g. [Ov-E] [SB, Form] in MDL --> SB is visible
					it("shows a back-button which cancels the current views", () => {
						const view1 = { name: "View1", activityId: "A" };
						const view1Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view1
						};

						const view2 = { name: "View2", activityId: "B" };
						const view2Info: ViewWithRegionReference = {
							...viewInformationContent,
							...view2
						};

						const view3 = { name: "View-Sidebar", activityId: "B" };
						const view3Info: ViewWithRegionReference = {
							...viewInformationSidebar,
							...view3
						};

						const result = MobileNavigationAction.calculate({
							activityIdMap: { A: undefined, B: "A" },
							listOfViews: [view1Info, view2Info, view3Info],
							regionInformation: [
								{
									regionReference: ["SIDEBAR"],
									views: [view3]
								},
								{
									regionReference: ["CONTENT"],
									views: [view2, view1],
									clearedAfter: 0
								}
							],
							visibleRegion
						});

						assertCancelResult(result, ["B"]);
					});
				});
			});

			describe("and there are views which are not visible due to a clear", () => {
				// e.g. [Ov-E] [CLEAR] [SB, Form] in MDL --> SB is visible
				it("shows a back-button which cancels the current views", () => {
					const view1 = { name: "View1", activityId: "A" };
					const view1Info: ViewWithRegionReference = {
						...viewInformationContent,
						...view1
					};

					const view2 = { name: "View2", activityId: "B" };
					const view2Info: ViewWithRegionReference = {
						...viewInformationContent,
						...view2
					};

					const view3 = { name: "View-Sidebar", activityId: "B" };
					const view3Info: ViewWithRegionReference = {
						...viewInformationSidebar,
						...view3
					};

					const result = MobileNavigationAction.calculate({
						activityIdMap: { A: undefined, B: undefined },
						listOfViews: [view1Info, view2Info, view3Info],
						regionInformation: [
							{
								regionReference: ["SIDEBAR"],
								views: [view3]
							},
							{
								regionReference: ["CONTENT"],
								views: [view2]
							}
						],
						visibleRegion
					});

					assertCancelResult(result, ["B"]);
				});
			});
		});
	});
});
