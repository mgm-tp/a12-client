// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

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
