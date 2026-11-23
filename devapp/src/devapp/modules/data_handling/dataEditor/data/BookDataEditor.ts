// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
