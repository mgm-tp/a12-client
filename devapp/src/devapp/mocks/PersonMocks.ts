// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
