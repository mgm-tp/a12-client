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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api";

import { notUndefined } from "../../../../typeguards.js";

import type { FormModel } from "../form-model.js";

import type {
	NotRelevantCase,
	NotRelevantConfig,
	NotRelevantConfigEntry
} from "./notRelevantConfig.js";

export function generateNotRelevantConfigFromFormModel(formModel: FormModel): NotRelevantConfig {
	const config: {
		[path: string]: NotRelevantConfigEntry | undefined;
	} = {};

	formModel.content.fieldConfiguration.field?.forEach(fce => {
		const fieldPath = ModelPath.toString(fce.elementPath);

		const newCases = convertFceToCases(fce);

		if (newCases.length) {
			const currentEntry = config[fieldPath];
			if (currentEntry) {
				const mergedCases = currentEntry?.cases.concat(newCases) ?? [];
				config[fieldPath] = { ...currentEntry, cases: mergedCases };
			} else {
				config[fieldPath] = { cases: newCases };
			}
		}
	});

	formModel.content.groupConfiguration.group?.forEach(gce => {
		const groupPath = ModelPath.toString(gce.groupPath);

		const newCases = convertGceToCases(gce);

		if (newCases.length) {
			const currentEntry = config[groupPath];
			if (currentEntry) {
				const mergedCases = currentEntry?.cases.concat(newCases) ?? [];
				config[groupPath] = { ...currentEntry, cases: mergedCases };
			} else {
				config[groupPath] = { cases: newCases };
			}
		}
	});

	return config;
}

function convertFceToCases(fce: FormModel.FieldConfigurationEntry): NotRelevantCase[] {
	return fce.dependentField?.case.length ? convertDependencyToCases(fce.dependentField) : [];
}

function convertGceToCases(gce: FormModel.GroupConfigurationEntry): NotRelevantCase[] {
	return gce.dependentGroup?.case.length ? convertDependencyToCases(gce.dependentGroup) : [];
}

function convertDependencyToCases(dependency: FormModel.DependentGroup): NotRelevantCase[] {
	return dependency.case
		.map(caze => {
			if (caze.notRelevant) {
				return {
					conditions: [
						{
							fieldPath: dependency.masterFieldPath,
							value: caze.masterValueTyped
						}
					]
				};
			}

			return undefined;
		})
		.filter(notUndefined);
}
