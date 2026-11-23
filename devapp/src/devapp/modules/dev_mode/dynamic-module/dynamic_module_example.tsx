// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useSelector } from "react-redux";

import { ModuleRegistryProvider } from "@com.mgmtp.a12.client/client-core";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements as CBE } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";

import { EXAMPLE_DYNAMIC_MODULE } from "./example_dynamic_module.js";

export function DynamicModuleExampleView(): JSX.Element {
	const moduleLoaded = useSelector(() =>
		ModuleRegistryProvider.getInstance().getAllModules().includes(EXAMPLE_DYNAMIC_MODULE)
	);

	return (
		<ActionContentbox headingElements={<CBE.Title text="Dynamic Module Example" />}>
			<p>Use the following buttons to register or remove a module at runtime.</p>

			<p>You should see the module appearing / disappearing from the menu.</p>

			<ButtonGroup>
				<Button
					onClick={() => ModuleRegistryProvider.getInstance().addModule(EXAMPLE_DYNAMIC_MODULE)}
					primary
					label="Register Dynamic Module"
					disabled={moduleLoaded}
					icon={<Icon>add</Icon>}
				/>
				<Button
					onClick={() => ModuleRegistryProvider.getInstance().removeModule(EXAMPLE_DYNAMIC_MODULE)}
					primary
					destructive
					label="Remove Dynamic Module"
					disabled={!moduleLoaded}
					icon={<Icon>remove</Icon>}
				/>
			</ButtonGroup>
		</ActionContentbox>
	);
}
