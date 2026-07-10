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

import type { JSX } from "react";
import { useSelector } from "react-redux";
import type { Dispatch } from "redux";

import type {
	Activity,
	DynamicConfiguration,
	DynamicFlow,
	DynamicMenu,
	ViewNGProps
} from "@com.mgmtp.a12.client/client-core";
import {
	ActivityActions,
	ActivitySelectors,
	ApplicationActions,
	DynamicGenericCaseMenu,
	Model,
	ModelSelectors
} from "@com.mgmtp.a12.client/client-core";
import {
	ActionContentbox,
	ContentBoxElements,
	Icon,
	Status,
	type BaseColumnType,
	Table
} from "@com.mgmtp.a12.widgets/widgets-core";

const CONCEPT_DESCRIPTOR = { section: "UIHandling", feature: "CaseConcept" };
const MODEL_LOADING_DESCRIPTOR = { section: "UIHandling", feature: "CaseModelLoading" };

function matchesCaseConcept(descriptor: Activity.Descriptor): boolean {
	return descriptor.section === "UIHandling" && descriptor.feature === "CaseConcept";
}

function matchesCaseModelLoading(descriptor: Activity.Descriptor): boolean {
	return descriptor.section === "UIHandling" && descriptor.feature === "CaseModelLoading";
}

const dynamicFlows: DynamicFlow[] = [
	{
		name: "ui_handling.case.concept",
		scenes: [
			{
				name: "CaseConcept",
				matches: matchesCaseConcept,
				defaultCase: "TableCase",
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DynamicGenericCaseMenu,
							region: "/SIDEBAR"
						}
					]
				},
				cases: [
					{
						name: "TableCase",
						label: {
							key: "ui_handling.case-concept.TableCase",
							defaults: { en: "Table View", de: "Tabellen-View" }
						},
						sceneChange: {
							onEnter: [
								{
									type: "DYNAMIC_ADD_VIEW",
									component: TableCase,
									region: "/CONTENT"
								}
							]
						}
					},
					{
						name: "ChartCase",
						label: {
							key: "ui_handling.case-concept.ChartCase",
							defaults: { en: "Chart View", de: "Diagramm-View" }
						},
						sceneChange: {
							onEnter: [
								{
									type: "DYNAMIC_ADD_VIEW",
									component: ChartCase,
									region: "/CONTENT"
								}
							]
						}
					}
				]
			}
		]
	},
	{
		name: "ui_handling.case.model-loading",
		scenes: [
			{
				name: "CaseModelLoading",
				matches: matchesCaseModelLoading,
				defaultCase: "DefaultCaseModel",
				sceneChange: {
					onEnter: [
						{
							type: "DYNAMIC_ADD_VIEW",
							component: DynamicGenericCaseMenu,
							region: "/SIDEBAR"
						}
					]
				},
				cases: [
					{
						name: "DefaultCaseModel",
						label: {
							key: "ui_handling.case-concept.DefaultCaseModel",
							defaults: { en: "default case model", de: "Standardcasemodell" }
						},
						sceneChange: {
							onEnter: [
								{
									type: "DYNAMIC_ADD_VIEW",
									component: ModelDefaultCase,
									region: "/CONTENT",
									models: [{ modelType: "document", name: "DefaultCaseExampleModel" }]
								}
							]
						}
					},
					{
						name: "Model",
						label: {
							key: "ui_handling.case-concept.Model",
							defaults: { en: "second case model", de: "Modell im zweiten Case" }
						},
						sceneChange: {
							onEnter: [
								{
									type: "DYNAMIC_ADD_VIEW",
									component: ModelSecondCase,
									region: "/CONTENT",
									models: [{ modelType: "document", name: "SecondCaseExampleModel" }]
								}
							]
						}
					}
				]
			}
		]
	}
];

function onConceptClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: CONCEPT_DESCRIPTOR,
				loadingState: "without"
			}),
			descriptor: {}
		})
	);
}

function onModelLoadingClick(dispatch: Dispatch): void {
	dispatch(
		ApplicationActions.startMainActivityRequested({
			action: ActivityActions.create({
				activityDescriptor: MODEL_LOADING_DESCRIPTOR,
				loadingState: "missing"
			}),
			descriptor: {}
		})
	);
}

function selectMenus(state: object): DynamicMenu[] {
	const conceptActivities = ActivitySelectors.activitiesByDescriptor(CONCEPT_DESCRIPTOR)(state);
	const modelLoadingActivities =
		ActivitySelectors.activitiesByDescriptor(MODEL_LOADING_DESCRIPTOR)(state);
	return [
		{
			id: "ui_handling.case-concept.concept",
			label: {
				key: "ui_handling.case-concept.concept",
				defaults: { en: "Concept", de: "Konzept" }
			},
			action: onConceptClick,
			selected: conceptActivities.at(0) !== undefined
		},
		{
			id: "ui_handling.case-concept.model-loading",
			label: {
				key: "ui_handling.case-concept.model-loading",
				defaults: { en: "Model Loading", de: "Nachladen von Modellen" }
			},
			action: onModelLoadingClick,
			selected: modelLoadingActivities.at(0) !== undefined
		}
	];
}

export const CaseConceptModule: DynamicConfiguration = {
	id: "ui_handling.case-concept",
	flows: dynamicFlows,
	menus: selectMenus
};

const COLUMNS: BaseColumnType<number>[] = [
	{
		label: "n",
		dataGetter: ({ rowIndex }) => rowIndex
	},
	{
		label: "recaman(n)",
		dataGetter: ({ row }) => row
	}
];

function TableCase(props: ViewNGProps): JSX.Element {
	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title text="Case Concept" ariaLevel={props.ariaLevel} />}
		>
			<p>Cases allow to switch between different UIs without changing Activities.</p>
			<p>
				In this example, two cases show different views on the same data. Use the menu on the left
				to switch between the two cases.
			</p>
			<p>
				The below table shows the numerical values of the{" "}
				<a href="https://oeis.org/A005132">Recaman sequence</a>.
			</p>
			<Table data={RECAMAN} columns={COLUMNS} />
		</ActionContentbox>
	);
}

function ChartCase(): JSX.Element {
	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title text="Case Concept" />}
		>
			<p>This is a graphical representation of the sequence.</p>
			<RecamanChart />
		</ActionContentbox>
	);
}

const DEFAULT_CASE_EXAMPLE_MODEL_NAME = "DefaultCaseExampleModel";
const SECOND_CASE_EXAMPLE_MODEL_NAME = "SecondCaseExampleModel";

const MIN_HEIGHT = { minHeight: "180px" };

function ModelDefaultCase(props: ViewNGProps): JSX.Element {
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Lazy Loading of Models for Cases - Start"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<div style={MIN_HEIGHT}>
				<p>
					It is possible to define additional models in the application model directives of cases.
					These models are only loaded once the case is entered the first time.
				</p>

				<p>In this example we have two cases for which additional models are defined:</p>
				<ul>
					<li>
						The first is the default case of the scene. Its additional model is loaded, when the
						activity is created.
						<br />
						It displays the loading state of its own and the additional model of the second case.
					</li>
					<li>
						The second case defines an additional model, which shouldn&apos;t be loaded as long as
						the second case has not yet been entered.
					</li>
				</ul>

				<p>
					Use the menu on the left to switch to the second case. This will trigger the loading of
					its additional model.
				</p>
				<p>Reload the page to reset the example.</p>
			</div>
			<ModelCaseStatus name={DEFAULT_CASE_EXAMPLE_MODEL_NAME} />
			<ModelCaseStatus name={SECOND_CASE_EXAMPLE_MODEL_NAME} />
		</ActionContentbox>
	);
}

function ModelSecondCase(props: ViewNGProps): JSX.Element {
	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Lazy Loading of Models for Cases - Trigger"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<div style={MIN_HEIGHT}>
				<p>Now the loading of the additional model should have been triggered.</p>
			</div>
			<ModelCaseStatus name={DEFAULT_CASE_EXAMPLE_MODEL_NAME} />
			<ModelCaseStatus name={SECOND_CASE_EXAMPLE_MODEL_NAME} />
		</ActionContentbox>
	);
}

function ModelCaseStatus(props: { name: string }): JSX.Element {
	const { name } = props;
	const loaded = useExampleModelLoaded(name);

	return (
		<>
			<p>
				<strong>{`Loading state of additional model '${name}':`}</strong>
			</p>
			<Status
				icon={<Icon>{loaded ? "check_circle" : "error"}</Icon>}
				variant={loaded ? "success" : "error"}
			>
				{loaded ? "loaded" : "missing"}
			</Status>
		</>
	);
}

function useExampleModelLoaded(name: string): boolean {
	const modelDescriptor: Model.Descriptor = {
		modelType: "document",
		name
	};

	return useSelector(
		state =>
			ModelSelectors.modelByName(modelDescriptor.name, Model.isDocumentModel)(state) !== undefined
	);
}

const RECAMAN = recaman(100);

const STYLE = {
	stroke: "black",
	strokeWidth: RECAMAN.length / 1000.0,
	fill: "none"
};

function RecamanChart(): JSX.Element {
	const path = ["M 0 0"];
	for (let n = 1; n < RECAMAN.length; n++) {
		path.push(computeCirclePath(n));
	}

	return (
		<svg
			width="900"
			height="300"
			viewBox={`0 -${RECAMAN.length / 2} ${RECAMAN.length * 2.5} ${RECAMAN.length}`}
		>
			<g>
				<path d={path.join("\n")} style={STYLE} />
			</g>
		</svg>
	);
}

function computeCirclePath(n: number): string {
	const currentValue = RECAMAN[n];
	const lastValue = RECAMAN[n - 1];
	const radius = Math.abs(currentValue - lastValue) / 2;
	const sweepFlag = currentValue < lastValue ? n % 2 : (n + 1) % 2;
	return "A " + radius + " " + radius + " 0 0 " + sweepFlag + " " + currentValue + " 0";
}

/**
 * Recamán's sequence (or Recaman's sequence)
 * a(0) = 0;
 * for n > 0,
 * a(n) = a(n-1) - n if positive and not already in the sequence
 * otherwise a(n) = a(n-1) + n.
 */
function recaman(size: number): number[] {
	const a = [0];
	for (let n = 1; n < size; n++) {
		const minus = a[n - 1] - n;
		const plus = a[n - 1] + n;
		a[n] = minus > 0 && !a.includes(minus) ? minus : plus;
	}
	return a;
}
