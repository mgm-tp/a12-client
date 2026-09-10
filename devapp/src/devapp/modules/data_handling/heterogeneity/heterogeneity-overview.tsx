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

/**
 * A detailed example for the integration of the default variant selection UI
 * into an overview engine view.
 */
import type { JSX } from "react";
import { useCallback, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { NEW_INSTANCE_IDENTIFIER, ModelSelectors } from "@com.mgmtp.a12.client/client-core";
import {
	defaultVariantSelectionMapper,
	VariantSelection
} from "@com.mgmtp.a12.client/client-core/heterogeneity";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { ModalOverlay } from "@com.mgmtp.a12.widgets/widgets-core/lib/modal-overlay/main/modal-overlay.view.js";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";

import type { SimpleOverviewProps } from "../../../mocks/SimpleOverview/view.js";
import { SimpleOverview } from "../../../mocks/SimpleOverview/view.js";

import { createHeterogeneousDocument } from "./sagas.js";
import type { Food } from "./types.js";

const { ActionBarGroupArea, ActionBarGroup } = ContentBoxElements;

export function HeterogeneityOverview(props: View): JSX.Element {
	/** In case an abstract type is selected, it is held here */
	const [abstractModelSelected, setAbstractModelSelected] = useState(
		undefined as string | undefined
	);

	const dispatch = useDispatch();

	const modelGraph = useSelector(ModelSelectors.modelGraph());

	const onVariantSelected = useCallback(
		(model: string) =>
			dispatch(
				createHeterogeneousDocument({
					activityId: props.activityId,
					model,
					instance: NEW_INSTANCE_IDENTIFIER
				})
			),
		[dispatch, props.activityId]
	);

	/**
	 * Handling of event buttons. If the action and variant annotations are
	 * present, use them to either display the variant selection (for abstract
	 * types) or to directly signal the selection of a (concrete) type.
	 */
	const onAddDocument = useCallback(
		(variant: string) => () => {
			const type = modelGraph.documentModels.find(m => m.modelId === variant);
			if (type !== undefined) {
				if (type.abstractModel) {
					setAbstractModelSelected(variant);
				} else {
					onVariantSelected(variant);
				}
			}
		},
		[modelGraph.documentModels, onVariantSelected]
	);

	/** If a variant is selected, close the modal and dispatch action */
	const onVariantSelectedMemo = useCallback(
		(variant: string) => {
			setAbstractModelSelected(undefined);
			onVariantSelected(variant);
		},
		[onVariantSelected]
	);

	/** On cancel, close the modal */
	const onCancel = useCallback(() => {
		setAbstractModelSelected(undefined);
	}, [setAbstractModelSelected]);

	return (
		<>
			<SimpleFoodOverview
				{...props}
				columns={Columns}
				subActionBar={
					<ActionBarGroupArea
						leftSlot={[
							<ActionBarGroup role="toolbar" key={"toolbar"}>
								<Button
									icon={<Icon>add</Icon>}
									onClick={onAddDocument("SubType_Healthy-document")}
									label="Add healthy food"
								/>
								<Button
									icon={<Icon>add</Icon>}
									onClick={onAddDocument("SubType_Unhealthy-document")}
									label="Add unhealthy food"
								/>
							</ActionBarGroup>
						]}
					/>
				}
			/>
			{abstractModelSelected && (
				<VariantSelectionModal
					{...props}
					baseType={abstractModelSelected}
					onVariantSelected={onVariantSelectedMemo}
					onCancel={onCancel}
				/>
			)}
		</>
	);
}

export function SimpleFoodOverview(props: SimpleOverviewProps): JSX.Element {
	return (
		<SimpleOverview
			{...props}
			title="Heterogeneity Overview"
			columns={Columns}
			headingButtons={null}
		/>
	);
}

const Columns: BaseColumnType<{ root: Food }>[] = [
	{
		label: "Name of food",
		dataGetter: ({ row }) => row.root.Name
	}
];

interface VariantSelectionModalProps extends View {
	readonly baseType: string;
	onVariantSelected(variant: string): void;
	onCancel(): void;
}

/**
 * Render a modal to select a variant based on a selected (abstract) root.
 *
 * We use both the default defaultVariantSelectionMapper as well as the
 * default VariantSelection React component.
 */
function VariantSelectionModal(props: VariantSelectionModalProps): JSX.Element | null {
	const localizer = useContext(LocalizerContext).localizer;
	const modelGraph = useSelector(ModelSelectors.modelGraph());

	const rootType = modelGraph.documentModels.find(dm => dm.modelId === props.baseType);

	if (!rootType?.subTypes?.length) {
		return null;
	}

	const variantSelectionMapper = defaultVariantSelectionMapper(modelGraph, localizer);
	const variantSelectionItems = variantSelectionMapper(rootType);

	const variantSelectionTitle =
		localizer({
			key: "examples.data-handling.heterogeneity.select-title"
		}) ?? "Select variant";

	return (
		<ModalOverlay closeOnEsc closeOnOutsideClick onClose={props.onCancel}>
			<ActionContentbox
				headingElements={<ContentBoxElements.Title text={variantSelectionTitle} ariaLevel={1} />}
				headingButtons={
					<ContentBoxElements.HeadingActionButton
						onClick={props.onCancel}
						icon={<Icon>close</Icon>}
						invert
					/>
				}
			>
				<VariantSelection
					variants={variantSelectionItems}
					onSelect={dataModel => {
						props.onVariantSelected(dataModel);
					}}
				/>
			</ActionContentbox>
		</ModalOverlay>
	);
}
