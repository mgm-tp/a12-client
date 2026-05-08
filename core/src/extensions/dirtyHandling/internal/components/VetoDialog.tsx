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

import type { JSX, ReactNode } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";

import { ActivityActions, ActivitySelectors } from "../../../../core/activity/index.js";
import { ClientWidgetMapContext } from "../../../../core/ClientWidgetMap.js";

import { DEFAULT_TRANSLATIONS, RESOURCE_KEYS } from "../languages/index.js";

/**
 * Props of the Veto dialog.
 */
export interface VetoDialogProps {
	/**
	 * React children
	 */
	readonly children?: ReactNode;
}

/**
 * @internal
 */
export function DefaultVetoDialog(props: VetoDialogProps): JSX.Element {
	const dispatch = useDispatch();

	const localizer = useContext(LocalizerContext).localizer;
	const activity = useSelector(ActivitySelectors.activityByCancelConfirmationRequired());

	const { ModalNotification, ButtonGroup, Button } = useContext(ClientWidgetMapContext);

	const vetoDialog = activity ? (
		<ModalNotification
			closeOnEsc
			closeOnOutsideClick
			onClose={() => {
				dispatch(
					ActivityActions.responseCancelConfirmation({ activityId: activity.id, veto: true })
				);
			}}
			title={localizer(
				localizableFromLocalizationTreeMap(RESOURCE_KEYS.veto.title, DEFAULT_TRANSLATIONS)
			)}
			variant="warning"
			footer={
				<ButtonGroup alignment="right">
					<Button
						label={localizer(
							localizableFromLocalizationTreeMap(
								RESOURCE_KEYS.veto.buttonAbort,
								DEFAULT_TRANSLATIONS
							)
						)}
						onClick={() =>
							dispatch(
								ActivityActions.responseCancelConfirmation({ activityId: activity.id, veto: true })
							)
						}
					/>
					<Button
						label={localizer(
							localizableFromLocalizationTreeMap(
								RESOURCE_KEYS.veto.buttonDiscard,
								DEFAULT_TRANSLATIONS
							)
						)}
						onClick={() =>
							dispatch(
								ActivityActions.responseCancelConfirmation({ activityId: activity.id, veto: false })
							)
						}
						primary
						destructive
					/>
				</ButtonGroup>
			}
		>
			<p>
				{localizer(
					localizableFromLocalizationTreeMap(RESOURCE_KEYS.veto.message, DEFAULT_TRANSLATIONS, {
						activityId: { type: "plain", value: activity.id }
					})
				)}
			</p>
		</ModalNotification>
	) : undefined;

	return (
		<>
			{props.children}
			{vetoDialog}
		</>
	);
}
