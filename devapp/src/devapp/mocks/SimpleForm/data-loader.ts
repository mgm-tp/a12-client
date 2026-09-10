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

import type { Activity, DataLoader } from "@com.mgmtp.a12.client/client-core";
import { NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";
import { Dispatcher } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/dispatch/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { documentProvider } from "../MockServices.js";
import { isPlatformServerProfile } from "../utils.js";

import { SingleDocumentData } from "./data.js";

const language = "en";
const documentService = new DocumentServiceFactory().getDocumentService();

type Data = SingleDocumentData;

export class SimpleFormDataLoader implements DataLoader<Data> {
	readonly name = "SimpleFormDataLoader";

	private operationCounter = 0;

	constructor(
		private readonly params?: {
			initialDocument: Record<string, unknown>;
			canHandle: (ad: Activity.Descriptor) => boolean;
		}
	) {}

	canHandle(ad: Activity.Descriptor): boolean {
		return this.params?.canHandle?.(ad) ?? !!ad.instance;
	}
	useActivityDescriptorModel() {
		return true;
	}

	async load(activity: Activity, models: Promise<DataLoader.Models>): Promise<Data> {
		if (!activity.descriptor.instance) {
			return Promise.reject("Instance must be set to load a document!");
		}

		if (activity.descriptor.instance === NEW_INSTANCE_IDENTIFIER) {
			if (!activity.descriptor.model) {
				return Promise.reject("Model must be set to create a document!");
			}
			return {
				document: {
					id: NEW_INSTANCE_IDENTIFIER,
					modelId: activity.descriptor.model,
					...this.params?.initialDocument
				}
			};
		}

		if (isPlatformServerProfile()) {
			const [{ result }] = await Dispatcher.rpc(language, [
				{
					jsonrpc: "2.0",
					method: "GET_DOCUMENT",
					id: `${this.name}-${this.operationCounter++}`,
					params: { docRef: activity.descriptor.instance }
				}
			]);
			const { document, docRef: id, documentModelName: modelId } = result;

			const { documentModel: documentModelFromModelsPromise } = await models;

			if (!documentModelFromModelsPromise) {
				return Promise.reject("No suitable document model was provided!");
			}

			return {
				document: {
					...documentService.parseDates(document, documentModelFromModelsPromise),
					id,
					modelId
				}
			};
		} else {
			const { documentModel } = await models;

			if (!documentModel) {
				return Promise.reject("No suitable document model was provided!");
			}

			return { document: documentProvider(activity.descriptor.instance) };
		}
	}

	async save(
		activityDescriptor: Activity.Descriptor,
		data: Data,
		documentModel: DocumentModel | undefined
	): Promise<Data> {
		if (!activityDescriptor.instance) {
			return Promise.reject("Instance must be set to load a document!");
		}

		if (!SingleDocumentData.isInstance(data)) {
			return Promise.reject("Activity does not contain suitable data!");
		}

		if (documentModel === undefined) {
			return Promise.reject("No suitable document model was provided!");
		}

		if (activityDescriptor.instance === NEW_INSTANCE_IDENTIFIER) {
			return this.add(documentModel, data);
		} else {
			return this.modify(documentModel, data);
		}
	}

	private async add(documentModel: DocumentModel, data: Data): Promise<Data> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { modelId, id, ...documentWithoutModelAndDocumentId } = data.document;

		if (isPlatformServerProfile()) {
			const [{ result }] = await Dispatcher.rpc(language, [
				{
					jsonrpc: "2.0",
					method: "ADD_DOCUMENT",
					id: `${this.name}-${this.operationCounter++}`,
					params: {
						documentModelName: modelId,
						document: documentService.formatDates(documentWithoutModelAndDocumentId, documentModel),
						locale: language
					}
				}
			]);

			return { document: { ...data.document, id: result.docRef } };
		}

		// in mock mode saving is not supported
		return { document: { ...data.document, id: crypto.randomUUID() } };
	}

	private async modify(documentModel: DocumentModel, data: Data): Promise<Data> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { modelId, id, ...documentWithoutModelAndDocumentId } = data.document;

		if (isPlatformServerProfile()) {
			await Dispatcher.rpc(language, [
				{
					jsonrpc: "2.0",
					method: "MODIFY_DOCUMENT",
					id: `${this.name}-${this.operationCounter++}`,
					params: {
						docRef: data.document.id,
						document: documentService.formatDates(documentWithoutModelAndDocumentId, documentModel),
						locale: language
					}
				}
			]);
		}

		// in mock mode saving is not supported
		return data;
	}

	delete(): Promise<void> {
		return Promise.reject("Delete operation is not supported.");
	}
}
