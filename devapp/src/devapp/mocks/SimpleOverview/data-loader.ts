// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { DataLoader } from "@com.mgmtp.a12.client/client-core";
import { Activity } from "@com.mgmtp.a12.client/client-core";
import { Dispatcher } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/dispatch/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { documentsProvider } from "../MockServices.js";
import { isPlatformServerProfile } from "../utils.js";

import type { DocumentListData } from "./data.js";
import type { SimpleFormSlice } from "./reducers.js";

const documentService = new DocumentServiceFactory().getDocumentService();

export class SimpleOverviewDataLoader implements DataLoader<DocumentListData> {
	readonly name = "SimpleOverviewDataLoader";

	private operationCounter = 0;

	useActivityDescriptorModel(): boolean {
		return true;
	}

	canHandle(activityDescriptor: Activity.Descriptor): boolean {
		return !activityDescriptor.instance;
	}

	async load(activity: Activity, models: Promise<DataLoader.Models>): Promise<DocumentListData> {
		const { documentModel: documentModelFromModelsPromise } = await models;

		if (!documentModelFromModelsPromise) {
			return Promise.reject("No suitable document model was provided!");
		}

		const slice = Activity.findDefaultDataHolder(activity)?.slices as SimpleFormSlice;

		const documents = (
			isPlatformServerProfile()
				? await this.loadDocumentsFromServer(documentModelFromModelsPromise)
				: documentsProvider(documentModelFromModelsPromise.header.id)
		).filter(document =>
			Object.values(document).some(v => String(v).includes(slice.fullTextSearch ?? ""))
		);

		return { documents, totalDocumentsCount: documents.length };
	}

	async save(): Promise<DocumentListData> {
		return Promise.reject("Save operation is not supported!");
	}

	async delete(): Promise<void> {
		return Promise.reject("Delete operation is not supported!");
	}

	private async loadDocumentsFromServer(
		documentModel: DocumentModel
	): Promise<Activity.Data.Document[]> {
		const requestId = `${this.name}-${this.operationCounter++}`;

		const [
			{
				result: { entries }
			}
		] = await Dispatcher.rpc("en", [
			{
				jsonrpc: "2.0",
				id: requestId,
				method: "QUERY",
				params: {
					query: {
						targetDocumentModel: documentModel.header.id,
						projectionName: "document",
						paging: {
							pageNumber: 0,
							pageSize: 100 // default services limit
						}
					}
				}
			}
		]);

		return entries.map(({ document, docRef, documentModelName: modelId }) => {
			return {
				...documentService.parseDates(document, documentModel),
				id: docRef,
				modelId
			};
		});
	}
}
