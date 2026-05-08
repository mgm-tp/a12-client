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

import type { Activity } from "@com.mgmtp.a12.client/client-core";

export interface Person extends Activity.Data.Document {
	Person: {
		PersonalData: {
			FirstName: string;
			LastName: string;
			PlaceOfBirth: string;
			Nationality: string;
			Salary: number;
		};
		Addresses: {
			Street: string;
			City: string;
			Country: string;
			PostCode: string;
		}[];
	};
}

/**
 * Mock document factory for Person model
 */
export function personDocument(i: number): Person {
	const placeOfBirth = i < placesOfBirth.length ? placesOfBirth[i] : placesOfBirth[0];
	const nationality = i < nationalities.length ? nationalities[i] : nationalities[0];

	const result = {
		id: `Person-document/${i}`,
		modelId: "Person-document",
		Person: {
			PersonalData: {
				FirstName: `FirstName${i}`,
				LastName: `LastName${i}`,
				PlaceOfBirth: placeOfBirth,
				Nationality: nationality,
				Salary: i * 1000
			},
			Addresses: [
				{
					Street: `First Street ${i}`,
					City: `First City ${i}`,
					Country: `Country ${i}`,
					PostCode: `${i}${i}${i}${i}${i}`
				},
				{
					Street: `Second Street ${i}`,
					City: `Second City ${i}`,
					Country: `Country ${i}`,
					PostCode: `${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}`
				}
			]
		}
	};
	return result;
}

const placesOfBirth = ["Berlin", "Prague", "Munich", "Hamburg", "Dresden", "Da Nang", "Grenoble"];
const nationalities = ["German", "Czech", "German", "German", "German", "Vietnamese", "French"];
