// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
		return this.params?.canHandle(ad) ?? !!ad.instance;
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
