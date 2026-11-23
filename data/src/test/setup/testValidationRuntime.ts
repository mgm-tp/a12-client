// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { IMetaKeys } from "@com.mgmtp.a12.kernel/kernel-core-runtime-api-ts/lib/main/js/a12internal/utils/IMetaKeys.js";
import type {
	DocumentComputationResult,
	DocumentModel,
	DocumentValidationResult,
	EntityInstancePath,
	GroupInstance
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import type { SupportedType } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import type { DocServiceFactory } from "../../data-mutation/validation-computation/docServiceFactory.js";
import type { DocumentRuntimeServiceFactory } from "../../data-mutation/validation-computation/validationRuntimeService.js";
import type { ValidatorProviderFactory } from "../../data-mutation/validation-computation/validatorProviderFactory.js";

/**
 * TODO: Enhance these factories to allow multiple different return values if a method is called more than once.
 */
export namespace KernelFixtures {
	export type CallArgs = Record<string, Record<string, unknown>[]>;
	export namespace RtService {
		export interface Config {
			readonly computation?: DocumentComputationResult;
			readonly validation?: DocumentValidationResult;
		}

		export function runtimeFactory(config: Config): DocumentRuntimeServiceFactory {
			return {
				createDocumentRtService() {
					return {
						compute: document => {
							addCall("compute", { document });
							return config.computation ?? createComputationResult();
						},
						computeA12internal: (document, externalComputations, changedFieldInstances) => {
							addCall("computeA12internal", {
								document,
								externalComputations,
								changedFieldInstances
							});
							return config.computation ?? createComputationResult();
						},
						validateFull: (document, valuesOfFieldInstancesToConsider) => {
							addCall("validateFull", {
								document,
								valuesOfFieldInstancesToConsider
							});
							return config.validation ?? createValidationResult();
						},
						validatePart: (document, relevantEntityInstances, valuesOfFieldInstancesToConsider) => {
							addCall("validatePart", {
								document,
								relevantEntityInstances,
								valuesOfFieldInstancesToConsider
							});
							return config.validation ?? createValidationResult();
						},
						// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
						applyComputationResult: (computationResult, document) => {
							addCall("applyComputationResult", {
								computationResult,
								document
							});
							return document;
						},
						coalesceBooleans: (document: Document) => {
							addCall("coalesceBooleans", { document });
							return document;
						}
					};
				}
			};
		}

		let _callArgs: CallArgs = {};

		export function getCallArgs(): CallArgs {
			return _callArgs;
		}

		function addCall(fnName: string, args: Record<string, unknown>) {
			if (!Object.hasOwn(_callArgs, fnName)) {
				_callArgs[fnName] = [];
			}
			_callArgs[fnName].push(args);
		}

		export function resetHistory(): void {
			_callArgs = {};
		}

		export function createValidationResult(
			result: Partial<DocumentValidationResult> = {}
		): DocumentValidationResult {
			return {
				messages: [],
				noErrorOccurred: true,
				...result
			};
		}

		export function createComputationResult(
			result: Partial<DocumentComputationResult> = {}
		): DocumentComputationResult {
			return {
				appliedTo(document) {
					return document;
				},
				clearedFieldInstances: [],
				// oxlint-disable-next-line typescript/no-deprecated -- kernel 30 declares this field required, and removes it in 31
				computedFieldInstances: [],
				computedFieldInstancesWithChanges: [],
				computedFieldInstancesWithErrors: [],
				computedFieldInstancesWithoutErrors: [],
				document: {},
				formalErrorsInOperands: [],
				noErrorOccurred: true,
				...result
			};
		}
	}

	export namespace DocService {
		let _callArgs: CallArgs = {};

		export function getCallArgs(): CallArgs {
			return _callArgs;
		}

		function addCall(fnName: string, args: Record<string, unknown>) {
			if (!Object.hasOwn(_callArgs, fnName)) {
				_callArgs[fnName] = [];
			}
			_callArgs[fnName].push(args);
		}

		export function resetHistory(): void {
			_callArgs = {};
		}

		export interface Config {
			readonly addTransientFields?: object;
			readonly formatDates?: object;
			readonly getAssignedObject?: SupportedType | GroupInstance | GroupInstance[];
			readonly getEntityPathsInDocument?: EntityInstancePath[];
			readonly parseDates?: object;
			readonly removeEmptyFieldsAndGroups?: object;
			readonly removeTransientFields?: object;
			readonly updateEntityInstance?: GroupInstance;
			readonly getByPath?: DocumentModel.Element;
			readonly getById?: ModelPath;
		}

		export function instance(config: Config): DocServiceFactory {
			return {
				getDocumentService: () => {
					return {
						addTransientFields(document, model) {
							addCall("addTransientFields", { document, model });
							return config.addTransientFields ?? document;
						},
						formatDates(document, model) {
							addCall("formatDates", { document, model });
							return config.formatDates ?? document;
						},
						getAssignedObject(document, path) {
							addCall("getAssignedObject", { document, path });
							return config.getAssignedObject;
						},
						getEntityPathsInDocument(document, searchPath) {
							addCall("getEntityPathsInDocument", { document, searchPath });
							return config.getEntityPathsInDocument ?? [];
						},
						parseDates(document, model) {
							addCall("parseDates", { document, model });
							return config.parseDates ?? document;
						},
						removeEmptyFieldsAndGroups(document, model) {
							addCall("removeEmptyFieldsAndGroups", { document, model });
							return config.removeEmptyFieldsAndGroups ?? document;
						},
						removeTransientFields(document, model) {
							addCall("removeTransientFields", { document, model });
							return config.removeTransientFields ?? document;
						},
						updateEntityInstance(document, path, update, documentModelElement) {
							addCall("updateEntityInstance", {
								document,
								path,
								update,
								documentModelElement
							});
							return config.updateEntityInstance ?? document;
						}
					};
				},
				getDocumentModelSearchService: () => {
					return {
						getByPath(path) {
							addCall("getByPath", { path });
							return config.getByPath;
						},
						getPathById(id) {
							addCall("getById", { id });
							return config.getById;
						}
					};
				}
			};
		}
	}

	export namespace ValidatorProvider {
		// not used in tests yet
		/*
		let _callArgs: CallArgs = {};

		export function getCallArgs(): CallArgs {
			return _callArgs;
		}

		function addCall(fnName: string, args: Record<string, unknown>) {
			if (!Object.hasOwn(_callArgs, fnName)) {
				_callArgs[fnName] = [];
			}
			_callArgs[fnName].push(args);
		}

		export function resetHistory(): void {
			_callArgs = {};
		}
        */

		interface MetaField {
			readonly path: string;
			readonly isRequired?: boolean;
			readonly operands?: string[];
			readonly relatedCalcFields?: string[];
		}

		interface MetaGroup {
			readonly path: string;
			readonly fieldList: MetaField[];
		}

		export interface Config {
			readonly metaFields?: MetaField[];
			readonly metaGroups?: MetaGroup[];
		}
		/*
		export class IterableCalcField implements Iterable<{ readonly matchesPath: boolean }> {
			constructor(private match: boolean) {}

			[Symbol.iterator](): Iterator<{ readonly matchesPath: boolean }, any, any> {
				let counter = 0;
				return {
					next: () => {
						return {
							done: counter++ > 0,
							value: { matchesPath: this.match }
						};
					}
				};
			}
		}
        */

		export function instance(config: Config): ValidatorProviderFactory {
			return {
				getValidatorProvider: () => {
					return {
						getCalculator: () => {},
						getValidator: () => {},
						getMetaModel: () => ({
							getValue: (key: string, ...args: any[]) => {
								if (config.metaFields && key === IMetaKeys.MODEL_META_FIELD) {
									const metaField = config.metaFields.find(metaField => metaField.path === args[0]);
									return metaField
										? {
												getValue: (currentKey: string) => getValueMetaField(metaField, currentKey)
											}
										: undefined;
								} else if (config.metaFields && key === IMetaKeys.MODEL_CALC_FIELDS) {
									return new Set(
										config.metaFields
											.filter(metaField => !!metaField.operands)
											.map(calcField => ({
												getValue: (currentKey: string) => getValueMetaField(calcField, currentKey)
											}))
									);
								} else if (config.metaGroups && key === IMetaKeys.MODEL_META_GROUP) {
									const metaGroup = config.metaGroups.find(metaGroup => metaGroup.path === args[0]);
									return metaGroup
										? {
												getValue: (currentKey: string) => getValueMetaGroup(metaGroup, currentKey)
											}
										: undefined;
								}
								return undefined;
							}
						})
					};
				}
			};
		}

		function getValueMetaField(field: MetaField, key: string) {
			if (key === IMetaKeys.FIELD_FULLNAME) {
				return field.path;
			} else if (key === IMetaKeys.FIELD_OPERANDS_SET) {
				return new Set(
					field.operands?.map(operand => ({
						getName: () => operand
					}))
				);
			} else if (key === IMetaKeys.FIELD_MANDATORY_GLOBAL_OR_IN_SURROUNDING_REPEATABLE_GROUP) {
				return field.isRequired;
			} else if (key === IMetaKeys.FIELD_TARGET_SET_FOR_CALC) {
				return new Set(
					field.relatedCalcFields?.map(relatedCalcField => ({
						getName: () => relatedCalcField
					}))
				);
			}
			return undefined;
		}

		function getValueMetaGroup(group: MetaGroup, key: string) {
			if (key === IMetaKeys.GROUP_FIELD_LIST) {
				return new Set(
					group.fieldList.map(field => ({
						getValue: (currentKey: string) => getValueMetaField(field, currentKey)
					}))
				);
			}
			return undefined;
		}
	}
}
