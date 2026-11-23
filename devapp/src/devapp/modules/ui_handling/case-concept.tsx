// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { type ApplicationModel, Model, ModelSelectors } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { Status } from "@com.mgmtp.a12.widgets/widgets-core/lib/status/main/status.view.js";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";
import { Table } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/table.view.js";

import type { SampleAppModule } from "../../utils/SampleAppModule.js";

import appmodel from "./case-concept.appmodel.json" with { type: "json" };

const CaseConceptModule: SampleAppModule = {
	id: "ui_handling.case-concept",
	model: () => appmodel as ApplicationModel,
	views: () => name => Views[name]
};

export default CaseConceptModule;

const Views: { [name: string]: View.ViewComponent } = {
	"CaseConcept.TableCase": TableCase,
	"CaseConcept.ChartCase": ChartCase,
	"CaseModelLoading.ModelDefaultCase": ModelDefaultCase,
	"CaseModelLoading.ModelSecondCase": ModelSecondCase
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

function TableCase(props: View): JSX.Element {
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

function ModelDefaultCase(props: View): JSX.Element {
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

function ModelSecondCase(props: View): JSX.Element {
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
