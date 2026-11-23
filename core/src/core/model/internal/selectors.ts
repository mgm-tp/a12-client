// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Header } from "@com.mgmtp.a12.base/base-model-api/lib/main/header/index.js";
import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import type { Activity } from "../../activity/internal/activity.js";
import { ActivitySelectors } from "../../activity/internal/selectors.js";
import {
	dynamicSceneByReference,
	dynamicSceneReferenceByActivityDescriptors
} from "../../configurationNG/internal/dynamicSelectors.js";
import type { DynamicDirective } from "../../configurationNG/internal/typings.js";
import type { Modifier } from "../../lenses.js";
import type { Selector } from "../../store/index.js";
import { createSliceSelector } from "../../store/internal/selectors.js";
import { isRecord } from "../../utils.js";

import { ApplicationModel } from "./ApplicationModel.js";
import { expandDescriptors } from "./expandDescriptors.js";
import { defaultModelTypeGuard, Model, type ModelTypeGuard } from "./Model.js";
import type { ModelMap, ModelState } from "./ModelState.js";
import type { ReferencedModel } from "./ReferencedModel.js";

function isModelsSlice(slice: unknown): slice is ModelState {
	return isRecord(slice) && isRecord(slice.applicationModel) && isRecord(slice.models);
}

/**@internal */
export const sliceSelector = createSliceSelector("models", isModelsSlice);

/**
 * These selectors provide access to the `ModelState` in the store.
 */
export namespace ModelSelectors {
	/**
	 * Selects the application model from the state
	 */
	export function applicationModel(): Selector<ApplicationModel> {
		return state => sliceSelector(state).applicationModel;
	}

	/**
	 * Selects the model graph from the state.
	 */
	export function modelGraph(): Selector<ModelGraph> {
		return state => sliceSelector(state).modelGraph;
	}

	export function models(): Selector<ModelMap> {
		return state => sliceSelector(state).models;
	}

	export function modelsLoaded(
		descriptors: readonly Model.Descriptor[]
	): Selector<ModelResult.ModelsLoaded> {
		return state => {
			const result: ModelAPI[] = [];

			const queue = [...descriptors];
			for (let descriptor = queue.shift(); descriptor !== undefined; descriptor = queue.shift()) {
				const model = ModelSelectors.modelByName(descriptor.name)(state);
				if (model === undefined) {
					const error = ModelSelectors.modelErrorByName(descriptor.name)(state);
					return { stateChanged: error !== undefined, returnValue: error };
				}

				result.push(model);
				// this extends the queue by the models referenced in the models given via 'descriptors' parameter
				queue.push(...getModelDescriptors(model));
			}

			return { stateChanged: true, returnValue: result };
		};
	}

	/**
	 * Selects the model with the given identifier from the state.
	 *
	 * As the return value of this selector always contains the
	 * "selected" value in `returnValue`, it should only be used in conjunction
	 * with `StoreSagas.waitForStateChange`.
	 */
	export function modelLoaded<T extends ModelAPI>(
		identifier: string,
		typeGuard: ModelTypeGuard<T> = defaultModelTypeGuard
	): Selector<ModelResult.ModelLoaded<T>> {
		return state => {
			const model = ModelSelectors.modelByName(identifier)(state);
			if (model === undefined) {
				const error = ModelSelectors.modelErrorByName(identifier)(state);
				return { stateChanged: error !== undefined, returnValue: error };
			}

			if (!typeGuard(model)) {
				return {
					stateChanged: true,
					returnValue: {
						type: "UNEXPECTED_TYPE",
						message: `Expected type of model "${model.header.id}" to match the given typeGuard.`
					}
				};
			}

			return {
				stateChanged: true,
				returnValue: { model }
			};
		};
	}

	/**
	 * Selects the model for the given `modelName`.
	 *
	 * Provide a `typeGuard` function for stronger typings.
	 *
	 * For accessing model loading errors please use the
	 * {@link ModelSelectors.modelErrorByName} selector.
	 *
	 * *IMPORTANT:*
	 * Due to convenience reasons models of type "document" contains the json
	 * as well as the js representation of a document model.
	 */
	export function modelByName<T extends ModelAPI = ModelAPI>(
		modelName: string,
		typeGuard: ModelTypeGuard<T> = defaultModelTypeGuard
	): Selector<T | undefined> {
		return state => {
			const modelEntry = sliceSelector(state).models[modelName];
			if (modelEntry === undefined || !isModelInstance(modelEntry)) {
				return undefined;
			}

			if (!typeGuard(modelEntry)) {
				return undefined;
			}

			return modelEntry;
		};
	}

	/**
	 * Selects the model loading error for the given `modelName`.
	 */
	export function modelErrorByName(modelName: string): Selector<Model.Error | undefined> {
		return state => {
			const modelEntry = sliceSelector(state).models[modelName];
			if (modelEntry === undefined || isModelInstance(modelEntry)) {
				return undefined;
			}

			return modelEntry;
		};
	}

	/**
	 * Selects the first matching model in a scene for the provided criteria.
	 *
	 * Provide a `typeGuard` function for stronger typings.
	 */
	export function modelInScene<T extends ModelAPI>(
		{ activityId, modelType, documentModel }: ModelSearchDescriptor,
		typeGuard: ModelTypeGuard<T> = defaultModelTypeGuard
	): Selector<T | undefined> {
		const modelDescriptorsByActivityIdSelector = modelDescriptorsByActivityId(activityId);

		return state => {
			const modelDescriptors = modelDescriptorsByActivityIdSelector(state);
			const modelDescriptor =
				modelDescriptors.find(
					d => d.modelType === modelType && d.documentModel === documentModel
				) ||
				// Fallback if the search with documentModel returns no result
				modelDescriptors.find(d => d.modelType === modelType);

			if (modelDescriptor === undefined) {
				return undefined;
			}

			return ModelSelectors.modelByName(modelDescriptor.name, typeGuard)(state);
		};
	}

	/**
	 * Selects all *loaded* models in the scene for the given activity.
	 */
	export function allModelsInScene(activityId: string): Selector<ModelAPI[]> {
		const selectModelDescriptors = modelDescriptorsByActivityId(activityId);
		const selectModelGraph = ModelSelectors.modelGraph();

		return state => {
			return expandDescriptors(selectModelDescriptors(state), selectModelGraph(state))
				.map(({ name }) => ModelSelectors.modelByName(name)(state))
				.filter((m): m is ModelAPI => m !== undefined);
		};
	}

	/**
	 * For all models in the scene for the given activity, returns either the model itself
	 * or an error for it if there exists a result for all models.
	 *
	 * If not all models of the scene are available yet, returns `undefined`.
	 *
	 * Can be used in conjunction with `StoreSagas.waitFor`.
	 */
	export function allLoadedModelsInScene(
		activityId: string
	): Selector<(ModelAPI | Model.Error)[] | undefined> {
		const selectModelDescriptors = modelDescriptorsByActivityId(activityId);
		const selectModelGraph = ModelSelectors.modelGraph();

		return state => {
			const allDescriptorsInScene = expandDescriptors(
				selectModelDescriptors(state),
				selectModelGraph(state)
			);

			const loadResults = allDescriptorsInScene.map(
				({ name }) =>
					ModelSelectors.modelByName(name)(state) ?? ModelSelectors.modelErrorByName(name)(state)
			);

			return loadResults.every((r): r is ModelAPI | Model.Error => r !== undefined)
				? loadResults
				: undefined;
		};
	}

	/**
	 * Selects the error for the first matching model in a scene for the provided criteria.
	 */
	export function modelErrorInScene({
		activityId,
		modelType,
		documentModel
	}: ModelSearchDescriptor): Selector<Model.Error | undefined> {
		const modelDescriptorsByActivityIdSelector = modelDescriptorsByActivityId(activityId);

		return state => {
			const modelDescriptors = modelDescriptorsByActivityIdSelector(state);
			const modelDescriptor =
				modelDescriptors.find(
					d => d.modelType === modelType && d.documentModel === documentModel
				) ||
				// Fallback if the search with documentModel returns no result
				modelDescriptors.find(d => d.modelType === modelType);

			if (modelDescriptor === undefined) {
				return undefined;
			}

			return ModelSelectors.modelErrorByName(modelDescriptor.name)(state);
		};
	}

	/**
	 * Selects all models errors in the scene for the given activity.
	 */
	export function allModelErrorsInScene(activityId: string): Selector<Model.Error[]> {
		const selectModelDescriptors = modelDescriptorsByActivityId(activityId);
		const selectModelGraph = ModelSelectors.modelGraph();

		return state => {
			return expandDescriptors(selectModelDescriptors(state), selectModelGraph(state))
				.map(({ name }) => ModelSelectors.modelErrorByName(name)(state))
				.filter((err): err is Model.Error => err !== undefined);
		};
	}

	/**
	 * Selects the first region which matches the given region {@link ApplicationModel.Region.Reference}.
	 *
	 * @param regionReference reference to region
	 */
	export function region(
		regionReference: ApplicationModel.Region.Reference
	): Selector<ApplicationModel.Region | undefined> {
		return (state: object) => {
			let current: ApplicationModel.Region | undefined = applicationModel()(state).content.region;
			for (const name of regionReference) {
				const search: ApplicationModel.Region[] = current.subRegions || [];
				current = search.find(sr => sr.name === name);
				if (current === undefined) {
					break;
				}
			}
			return current;
		};
	}

	/**
	 * Selects all sub region references which matches the given region {@link ApplicationModel.Region.Reference}.
	 *
	 * @param regionReference region reference
	 */
	export function subRegionRefs(
		regionReference: ApplicationModel.Region.Reference
	): Selector<ApplicationModel.Region.Reference[]> {
		const regionSelector = region(regionReference);
		return state => {
			const currentRegion = regionSelector(state);
			if (currentRegion === undefined) {
				throw new Error("region not found: " + regionReference);
			}
			return currentRegion.subRegions !== undefined
				? currentRegion.subRegions.map(sr => [...regionReference, sr.name])
				: [];
		};
	}

	export function modelDescriptorsByActivityId(activityId: string): Selector<Model.Descriptor[]> {
		const activityByIdSelector = ActivitySelectors.activityById(activityId);
		return state => {
			const activity = activityByIdSelector(state);
			if (activity === undefined) {
				return [];
			}

			return InternalModelSelectors.modelDescriptorsByActivity(activity)(state);
		};
	}

	/**
	 * Returns all models in the scene (including transitive models) for the given activity
	 * as {@link ReferencedModel.Instance} objects.
	 */
	export function referencedModelsInScene(
		activityId: string
	): Selector<ReferencedModel.Instance[]> {
		const selectModelDescriptors = modelDescriptorsByActivityId(activityId);
		const selectModelGraph = ModelSelectors.modelGraph();

		return state => {
			const directDescriptors = selectModelDescriptors(state);
			const directRefNames = directDescriptors.map(d => d.name);

			const allDescriptors = expandDescriptors(directDescriptors, selectModelGraph(state));

			return allDescriptors.map(d =>
				addTransitive(directRefNames, d.name)(referencedModelByDescriptor(d)(state))
			);
		};
	}

	function addTransitive(directRefs: string[], name: string): Modifier<ReferencedModel.Instance> {
		return r => (directRefs.includes(name) ? { ...r, direct: true } : r);
	}

	function referencedModelByDescriptor(d: Model.Descriptor): Selector<ReferencedModel.Instance> {
		return state => {
			const model = ModelSelectors.modelByName(d.name)(state);
			const error = ModelSelectors.modelErrorByName(d.name)(state);
			return model
				? {
						loadingState: "loaded",
						model
					}
				: error
					? {
							loadingState: "error",
							model: error
						}
					: {
							loadingState: "notLoaded",
							model: d
						};
		};
	}
}

export interface ModelSearchDescriptor {
	readonly activityId: string;
	readonly modelType: string;
	readonly documentModel?: string;
}

/**
 * @internal
 */
export const InternalModelSelectors = {
	/**
	 * Selects the model descriptors defined in the scene matching the activity.
	 * This includes model descriptors defined in the case that matches the
	 * activity's current case or, if no case is set, the default case of the
	 * scene.
	 *
	 * Note: If a document model is given in the model descriptor, it must match
	 * the model property of the activity descriptor, i.e. ui models for other
	 * heterogeneous types are not selected.
	 */
	modelDescriptorsByActivity(activity: Activity): Selector<Model.Descriptor[]> {
		const initiatingPathSelector = ActivitySelectors.initiatingPath(activity.id);
		return state => {
			const relevantActivities = [...initiatingPathSelector(state), activity];

			const dynamicSceneReference = dynamicSceneReferenceByActivityDescriptors(
				relevantActivities.map(a => a.descriptor)
			)(state);

			if (dynamicSceneReference) {
				const allModelDescriptors = dynamicModelDescriptors(
					dynamicSceneReference,
					activity.case
				)(state);

				return allModelDescriptors.filter(
					({ documentModel }) =>
						documentModel === undefined || documentModel === activity.descriptor.model
				);
			} else {
				const sceneReference =
					InternalModelSelectors.sceneReferenceByActivities(relevantActivities)(state);

				if (sceneReference === undefined) {
					return [];
				}

				const allModelDescriptors = modelDescriptors(sceneReference, activity.case)(state);

				return allModelDescriptors.filter(
					({ documentModel }) =>
						documentModel === undefined || documentModel === activity.descriptor.model
				);
			}
		};
	},
	modules(): Selector<ReadonlyArray<ApplicationModel.Module>> {
		return (state: object) => ModelSelectors.applicationModel()(state).content.modules;
	},
	sceneReferenceByActivities(
		activities: Activity[]
	): Selector<ApplicationModel.SceneReference | undefined> {
		return state => {
			return InternalModelSelectors.sceneReferences()(state).find(reference => {
				const s = InternalModelSelectors.sceneByReference(reference)(state);
				const relevantScenes = [...InternalModelSelectors.priorScenes(reference)(state), s];
				const offset = activities.length - relevantScenes.length;
				return (
					offset >= 0 &&
					relevantScenes.every(({ matchConditions }, index) =>
						matchConditions.every(matchCondition =>
							ApplicationModel.MatchCondition.evaluate(
								matchCondition,
								activities[offset + index].descriptor
							)
						)
					)
				);
			});
		};
	},
	sceneReferences(): Selector<ReadonlyArray<ApplicationModel.SceneReference>> {
		return (state: object) => {
			return InternalModelSelectors.modules()(state).flatMap(({ name: moduleName, flows }) =>
				flows.flatMap(({ name: flowName, scenes }) =>
					scenes.map(({ name: sceneName }) => ({ moduleName, flowName, sceneName }))
				)
			);
		};
	},
	sceneByReference({
		moduleName,
		flowName,
		sceneName
	}: ApplicationModel.SceneReference): Selector<ApplicationModel.Scene> {
		return (state: object) => {
			const module = InternalModelSelectors.modules()(state).find(
				({ name }) => name === moduleName
			);
			if (module === undefined) {
				throw new Error(`No module with the name "${moduleName}" exists.`);
			}

			const flow = module.flows.find(({ name }) => name === flowName);
			if (flow === undefined) {
				throw new Error(
					`No flow with the name "${flowName}" exists in the module "${moduleName}".`
				);
			}

			const scene = flow.scenes.find(({ name }) => name === sceneName);
			if (scene === undefined) {
				throw new Error(
					`No scene with the name "${sceneName}" exists in the flow "${flowName}" of the module "${moduleName}".`
				);
			}

			return scene;
		};
	},
	priorScenes(
		ref: ApplicationModel.SceneReference
	): Selector<ReadonlyArray<ApplicationModel.Scene>> {
		return (state: object) => {
			const path: ApplicationModel.Scene[] = [];
			let scene = InternalModelSelectors.sceneByReference(ref)(state);
			while (scene !== undefined && scene.priorScene !== undefined) {
				scene = InternalModelSelectors.sceneByReference({
					...ref,
					sceneName: scene.priorScene
				})(state);
				path.unshift(scene);
			}

			return path;
		};
	},
	caze(caseName: string): (scene: ApplicationModel.Scene) => ApplicationModel.Case | undefined {
		return ({ cases = [] }) => cases.find(({ name }) => name === caseName);
	},
	/**
	 * Selects the ui model with the given identifier
	 * and its document model from the state.
	 *
	 * As the return value of this selector always contains the
	 * "selected" value in `returnValue`, it should only be used in conjunction
	 * with `StoreSagas.waitForStateChange`.
	 */
	uiModelAndDocumentModelLoaded<T extends ModelAPI>(
		identifier: string,
		typeGuard: ModelTypeGuard<T> = defaultModelTypeGuard
	): Selector<ModelResult.EngineModelsLoaded<T>> {
		return state => {
			const uiModelResult = ModelSelectors.modelLoaded(identifier, typeGuard)(state);
			if (
				uiModelResult.returnValue === undefined ||
				Model.Error.isInstance(uiModelResult.returnValue)
			) {
				return { stateChanged: uiModelResult.stateChanged, returnValue: uiModelResult.returnValue };
			}
			const uiModel = uiModelResult.returnValue.model;

			const documentModelName = InternalModelSelectors.getDocumentModelReference(uiModel);

			const result = ModelSelectors.modelLoaded(
				documentModelName,
				Model.isDocumentAndValidationModel
			)(state);
			if (result.returnValue === undefined || Model.Error.isInstance(result.returnValue)) {
				return { stateChanged: result.stateChanged, returnValue: result.returnValue };
			}

			return {
				stateChanged: true,
				returnValue: { uiModel, documentAndValidationModel: result.returnValue.model }
			};
		};
	},
	/**
	 * Selects the ui model of the current scene
	 * and its document model from the state.
	 *
	 * As the return value of this selector always contains the
	 * "selected" value in `returnValue`, it should only be used in conjunction
	 * with `StoreSagas.waitForStateChange`.
	 */
	uiModelAndDocumentModelLoadedByActivityId<T extends ModelAPI>(
		activityId: string,
		modelDescriptor: {
			readonly modelType: string;
			readonly documentModel?: string;
		},
		typeGuard: ModelTypeGuard<T> = defaultModelTypeGuard
	): Selector<ModelResult.EngineModelsLoaded<T>> {
		return state => {
			const criteria = { activityId, ...modelDescriptor };
			const uiModel = ModelSelectors.modelInScene(criteria, typeGuard)(state);
			if (uiModel === undefined) {
				const error = ModelSelectors.modelErrorInScene(criteria)(state);
				return { stateChanged: error !== undefined, returnValue: error };
			}

			const documentModelName = InternalModelSelectors.getDocumentModelReference(uiModel);

			const result = ModelSelectors.modelLoaded(
				documentModelName,
				Model.isDocumentAndValidationModel
			)(state);
			if (result.returnValue === undefined || Model.Error.isInstance(result.returnValue)) {
				return { stateChanged: result.stateChanged, returnValue: result.returnValue };
			}

			return {
				stateChanged: true,
				returnValue: { uiModel, documentAndValidationModel: result.returnValue.model }
			};
		};
	},
	getDocumentModelReference({ header }: { readonly header: Header }): string {
		const { reference } = header.modelReferences?.find(x => x.modelType === "document") || {};
		if (reference === undefined) {
			throw new Error(`Could not find any document model reference in ${header.id}.`);
		}
		return reference;
	}
};

/** Function is only exported for testing reasons*/
export function modelDescriptors(
	sceneReference: ApplicationModel.SceneReference,
	activityCase?: string
): Selector<Model.Descriptor[]> {
	return (state: object) => {
		const scene = InternalModelSelectors.sceneByReference(sceneReference)(state);

		const result: Model.Descriptor[] = [];
		if (scene.sceneChange?.onEnter) {
			result.push(...collectModelDescriptors(scene.sceneChange.onEnter));
		}
		if (scene.sceneChange?.onExit) {
			result.push(...collectModelDescriptors(scene.sceneChange.onExit));
		}

		const relevantCaseName = activityCase ?? scene.defaultCase;
		const relevantCase = scene.cases?.find(caze => caze.name === relevantCaseName);
		if (relevantCase?.sceneChange?.onEnter) {
			result.push(...collectModelDescriptors(relevantCase.sceneChange.onEnter));
		}

		return result;
	};
}

function dynamicModelDescriptors(
	sceneReference: ApplicationModel.SceneReference,
	activityCase?: string
): Selector<Model.Descriptor[]> {
	return (state: object) => {
		const dynamicScene = dynamicSceneByReference(sceneReference)(state);

		const result: Model.Descriptor[] = [];
		if (dynamicScene.sceneChange.onEnter) {
			result.push(...collectModelDescriptors(dynamicScene.sceneChange.onEnter));
		}
		if (dynamicScene.sceneChange.onExit) {
			result.push(...collectModelDescriptors(dynamicScene.sceneChange.onExit));
		}

		const relevantCaseName = activityCase ?? dynamicScene.defaultCase;
		const relevantCase = dynamicScene.cases?.find(caze => caze.name === relevantCaseName);
		if (relevantCase?.sceneChange?.onEnter) {
			result.push(...collectModelDescriptors(relevantCase.sceneChange.onEnter));
		}

		return result;
	};
}

function collectModelDescriptors(
	directives: ReadonlyArray<ApplicationModel.Directive | DynamicDirective>
): Model.Descriptor[] {
	return directives.flatMap(directive =>
		(directive.type === "VIEW_ADD" || directive.type === "DYNAMIC_ADD_VIEW") &&
		directive.models !== undefined
			? directive.models
			: []
	);
}

/** @internal */
export function getModelDescriptors(model: ModelAPI): Model.Descriptor[] {
	// Create model descriptors from referenced models section
	return (
		model.header.modelReferences?.map(({ modelType, reference }) => ({
			modelType,
			name: reference
		})) ?? []
	);
}

export namespace ModelResult {
	export interface EngineModels<T extends ModelAPI = ModelAPI> {
		readonly uiModel: T;
		readonly documentAndValidationModel: Model.DocumentAndValidationModel;
	}

	export interface EngineModelsLoaded<T extends ModelAPI = ModelAPI> {
		readonly stateChanged: boolean;
		readonly returnValue: EngineModels<T> | Model.Error | undefined;
	}

	export interface ModelsLoaded {
		readonly stateChanged: boolean;
		readonly returnValue: ModelAPI[] | Model.Error | undefined;
	}

	/**
	 * This object should only be used in conjunction
	 * with `StoreSagas.waitForStateChange`.
	 *
	 * `returnValue` contains either:
	 * - the model, if it was loaded successfully
	 * - a model error, if the loading failed
	 * - undefined, if the model is not loaded yet
	 */
	export interface ModelLoaded<T extends ModelAPI = ModelAPI> {
		readonly stateChanged: boolean;
		readonly returnValue:
			| {
					readonly model: T;
			  }
			| Model.Error
			| undefined;
	}
}
