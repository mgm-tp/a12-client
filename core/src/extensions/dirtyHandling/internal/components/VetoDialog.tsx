// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
