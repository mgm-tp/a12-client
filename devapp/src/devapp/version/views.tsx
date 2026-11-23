// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext } from "react";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { HeaderTrigger } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/header-trigger/header-trigger.view.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import { List } from "@com.mgmtp.a12.widgets/widgets-core/lib/list/main/list.view.js";
import { PopUpMenu } from "@com.mgmtp.a12.widgets/widgets-core/lib/pop-up-menu/main/pop-up-menu.view.js";

import isOnSmallDevice from "../utils/isOnSmallDevice.js";

declare const __VERSION__: string | undefined;
declare const __SHORT_VERSION__: string | undefined;

const version = typeof __VERSION__ !== "undefined" ? __VERSION__ : "missing __VERSION__";
const shortVersion = typeof __SHORT_VERSION__ !== "undefined" ? __SHORT_VERSION__ : version;

const { Item } = List;

export function VersionMenu(): JSX.Element {
	const localizer = useContext(LocalizerContext).localizer;

	return (
		<PopUpMenu
			triggerElement={
				isOnSmallDevice(useContext(SizeContext).currentSize) ? (
					<HeaderTrigger graphic="info" />
				) : (
					<HeaderTrigger graphic="info" meta="arrow_drop_down" text={"V" + shortVersion} />
				)
			}
		>
			<List>
				<Item
					text={version}
					secondaryText={localizer({ key: "version.info.currentversion.label" })}
					readonly
					flipped
				/>
			</List>
		</PopUpMenu>
	);
}
