// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ModuleTestExtensions } from "@com.mgmtp.a12.client/client-core";

import { model } from "../devapp/appmodel.js";
import type { ActionSequence } from "../devapp/steps/ActionSequence.js";
import { SequencesProcessor } from "../devapp/steps/SequencesProcessor.js";
import { stepTestActionSequences } from "../devapp/steps/stepTestActionSequences.js";

import { createAppSetup } from "./steps.setup.js";

describe("steps", () => {
	after(ModuleTestExtensions.reset);

	describe("sequences", () => {
		for (const sequence of stepTestActionSequences) {
			createSequenceMochaTests(sequence);
		}
	});
});

/**
 * Creates mocha test cases dynamically for a sequence in a BDD way.
 * Each sequence step is executed and tested in an 'it' section.
 * @param sequenceNumber The number of the sequence the test cases shall be provided for
 */
function createSequenceMochaTests(sequence: ActionSequence) {
	describe(`[${sequence.name}]`, () => {
		it("executes the test successfully", async () => {
			const config = createAppSetup(model);

			const sequencesProcessor = new SequencesProcessor(
				stepTestActionSequences,
				config.store,
				config.stateHistory,
				() => {},
				() => {}
			);
			sequencesProcessor.onSequenceChange(sequence.name);

			for (let i = 0; i < sequence.steps.length; i++) {
				const sequenceStep = sequence.steps[i];
				const nextStepResult = await sequencesProcessor.nextStep(sequence, i);

				sequenceStep.test?.(
					nextStepResult.state,
					sequence.name + " - " + sequenceStep.description,
					nextStepResult.stateDiff
				);
			}

			sequence.cleanup?.();
		});
	});
}
