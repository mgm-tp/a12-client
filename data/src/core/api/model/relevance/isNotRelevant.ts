// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	DocumentModel,
	EntityInstancePath,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { getModelElement } from "../../../../data-model/getModelElement.js";
import { fieldValueAccessorForDocument } from "../../data/getValue.js";

import { ElementStateUtil } from "./elementState.js";
import type { NotRelevantConfig } from "./notRelevantConfig.js";

export function isNotRelevant(
	dm: DocumentModel,
	document: GroupInstance,
	targetElement: EntityInstancePath,
	notRelevantConfigs?: NotRelevantConfig[]
): boolean {
	const modelElement = getModelElement(dm, targetElement);

	const getValueByPath = fieldValueAccessorForDocument(document, dm);

	return modelElement?.type === "Field"
		? ElementStateUtil.isFieldNotRelevant(targetElement, getValueByPath, notRelevantConfigs)
		: ElementStateUtil.isGroupNotRelevant(targetElement, getValueByPath, notRelevantConfigs);
}
