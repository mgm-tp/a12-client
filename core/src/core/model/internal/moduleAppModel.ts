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

import type { ApplicationModel } from "./ApplicationModel.js";
import { APPLICATION_MODEL_PLACEHOLDER } from "./appModelPlaceholder.js";

/**
 * @internal
 *
 * Add the source models to the target model.
 *
 * NOTE: When the target is the placeholder model, new models should *not* be merged into it!
 * Instead, the placeholder model should be removed entirely (to allow users to set their own layout).
 *
 * @param source models that should be added
 * @param target model to which source should be added
 */
export function addApplicationModels(
	sources: ApplicationModel[],
	target: ApplicationModel
): ApplicationModel {
	return target.header.id === APPLICATION_MODEL_PLACEHOLDER.header.id
		? // no initial value, the accumulator will be the first element of the array
			sources.reduce((acc, cur) => addApplicationModel(cur, acc))
		: sources.reduce((acc, cur) => addApplicationModel(cur, acc), target);
}

/**
 * @internal
 *
 * Remove the source model from the target model. Currently, only modules are removed. Regions and languages that might
 * have been added previously by the source model are conserved.
 *
 * @param source model that should be removed
 * @param target model from which source should be removed
 */
export function removeApplicationModel(
	source: ApplicationModel,
	target: ApplicationModel
): ApplicationModel {
	return {
		...target,
		content: {
			...target.content,
			modules: removeModules(source.content.modules, target.content.modules)
		}
	};
}

/**
 * @internal
 *
 * Add the source model to the target model.
 *
 * @param source model that should be added
 * @param target model to which source should be added
 */
function addApplicationModel(source: ApplicationModel, target: ApplicationModel): ApplicationModel {
	return {
		...target,
		header: {
			...target.header,
			locales: addLanguages(source.header.locales, target.header.locales)
		},
		content: {
			...target.content,
			initialActivity: target.content.initialActivity ?? source.content.initialActivity,
			region: addRegions(source.content.region, target.content.region),
			modules: addModules(source.content.modules, target.content.modules)
		}
	};
}

/** @internal only exposed for testing */
export function addModules(
	source: readonly ApplicationModel.Module[],
	target: readonly ApplicationModel.Module[]
): readonly ApplicationModel.Module[] {
	return [...target, ...source];
}

/** @internal only exposed for testing */
export function removeModules(
	source: readonly ApplicationModel.Module[],
	target: readonly ApplicationModel.Module[]
): readonly ApplicationModel.Module[] {
	return target.filter(
		targetModule => targetModule.name !== findModule(targetModule.name, source)?.name
	);
}

function findModule(
	name: string,
	list: readonly ApplicationModel.Module[]
): ApplicationModel.Module | undefined {
	return list.find(m => m.name === name);
}

/**
 * @internal only exposed for testing
 *
 * Merge the source Region into the target Region. Only takes the sub-regions
 * into account.
 *
 * If a Region (identified by name) exists both in source and target, the
 * sub-regions of source are added to target. All other properties from the
 * source are ignored.
 */
export function addRegions(
	source: ApplicationModel.Region,
	target: ApplicationModel.Region
): ApplicationModel.Region {
	// merge all sub-regions
	const subRegions: ApplicationModel.Region[] = [];
	const regionNames = addStringsToSet(
		(source.subRegions || []).map(r => r.name),
		(target.subRegions || []).map(r => r.name)
	);
	for (const regionName of regionNames || []) {
		const mergedRegion = addRegionsIfPresent(
			source.subRegions?.find(r => r.name === regionName),
			target.subRegions?.find(r => r.name === regionName)
		);
		if (mergedRegion !== undefined) {
			subRegions.push(mergedRegion);
		}
	}
	return subRegions.length > 0
		? {
				...target,
				subRegions
			}
		: target;
}

// guards from undefined
function addRegionsIfPresent(
	source?: ApplicationModel.Region,
	target?: ApplicationModel.Region
): ApplicationModel.Region | undefined {
	// nothing to merge -> keep
	if (source === undefined) {
		return target;
	}

	// nothing to merge into -> take over
	if (target === undefined) {
		return source;
	}

	return addRegions(source, target);
}

interface Locale {
	code: string;
}
function addLanguages(
	source?: readonly Locale[],
	target?: readonly Locale[]
): Locale[] | undefined {
	return s2l(addStringsToSet(l2s(source), l2s(target)));
}

function l2s(ls?: readonly Locale[]): string[] | undefined {
	return ls?.map(l => l.code);
}

function s2l(ss?: readonly string[]): Locale[] | undefined {
	return ss?.map(s => ({ code: s }));
}

/**
 * Add all strings from source to target which are not already in it.
 */
function addStringsToSet(
	source?: readonly string[],
	target?: readonly string[]
): readonly string[] | undefined {
	// nothing to merge -> keep
	if (source === undefined || source.length === 0) {
		return target;
	}
	// nothing to merge into -> take over
	if (target === undefined || target.length === 0) {
		return source;
	}
	// merge new into existing
	const newLanguages = source.filter(l => target.indexOf(l) < 0);
	return target.concat(newLanguages);
}
