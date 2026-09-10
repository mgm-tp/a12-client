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

import type { DataEditor } from "@com.mgmtp.a12.client/client-core";
import { Activity, NEW_INSTANCE_IDENTIFIER } from "@com.mgmtp.a12.client/client-core";

import { SingleDocumentData } from "../../../../mocks/SimpleForm/index.js";

import type { AuthorDocument } from "./Author.js";
import type { Book } from "./Book.js";

export interface AuthorData {
	readonly document: AuthorDocument;
}

export interface BookData {
	readonly document: Book;
}

export class BookDataEditor implements DataEditor<AuthorData, BookData> {
	meta: DataEditor.Meta;

	constructor() {
		this.meta = {
			name: "BookDataEditor",
			childMatchConditions: [
				{
					key: "model",
					mustEqual: "Book"
				},
				{
					key: "instance",
					isSet: true
				}
			],
			parentMatchConditions: [
				{
					key: "model",
					mustEqual: "BookAuthor-document"
				},
				{
					key: "instance",
					isSet: true
				}
			]
		};
	}

	read(parentActivity: Activity, child: Activity.Descriptor): BookData {
		const { instance } = child;
		const data = Activity.findDefaultDataHolder(parentActivity)?.data;
		if (!SingleDocumentData.isInstance(data)) {
			throw new Error("Default data holder does not contain SingleDocumentData!");
		}

		const authorDoc = data.document as AuthorDocument;
		const { Books: books } = authorDoc.Author ?? { Books: undefined };
		if (instance === NEW_INSTANCE_IDENTIFIER) {
			return {
				...data,
				document: {
					BookDetails: {
						id: `Book-document/${books ? books.length + 1 : 1}`,
						title: "",
						publicationYear: new Date().getFullYear()
					}
				}
			};
		} else if (books !== undefined) {
			const book = books.find(b => b.BookDetails.id === instance);
			if (book !== undefined) {
				return { ...data, document: { ...book } };
			} else {
				throw new Error(
					`No book with id "${instance}" available in the BookAuthor "${authorDoc.id}"`
				);
			}
		} else {
			throw new Error(`No books available in the BookAuthor "${authorDoc.id}"`);
		}
	}

	write(parentActivity: Activity, _childAd: Activity.Descriptor, childData: BookData): AuthorData {
		const {
			document: {
				BookDetails: { id }
			}
		} = childData;
		const data = Activity.findDefaultDataHolder(parentActivity)?.data;
		if (!SingleDocumentData.isInstance(data)) {
			throw new Error("Default data holder does not contain SingleDocumentData!");
		}

		const authorDoc = data.document as AuthorDocument;
		const books = authorDoc.Author?.Books ?? [];

		const bookIdx = books.findIndex(b => b.BookDetails.id === id);
		const updatedBooks =
			bookIdx > -1
				? [...books.slice(0, bookIdx), childData.document, ...books.slice(bookIdx + 1)]
				: [...books, childData.document];
		const updatedAuthorDoc = {
			...authorDoc,
			Author: {
				...authorDoc.Author,
				Books: updatedBooks
			}
		};
		return {
			...data,
			document: updatedAuthorDoc
		};
	}
}

export const bookDataEditor = new BookDataEditor();
