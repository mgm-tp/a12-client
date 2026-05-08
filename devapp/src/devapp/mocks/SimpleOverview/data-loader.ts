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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
