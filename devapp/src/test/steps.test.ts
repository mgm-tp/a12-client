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

import { ModuleTestExtensions } from "@com.mgmtp.a12.client/client-core";

import { createComposableApplication } from "../devapp/composableSetup/createComposableAppsetup.js";
import type { ActionSequence } from "../devapp/steps/ActionSequence.js";
import { SequencesProcessor } from "../devapp/steps/SequencesProcessor.js";
import { stepTestActionSequences } from "../devapp/steps/stepTestActionSequences.js";

import { newFileSystemModelLoader } from "./mocks/ModelLoader.js";

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
 *
 * Step tests only support dynamic configuration setups.
 */
function createSequenceMochaTests(sequence: ActionSequence) {
	describe(`[${sequence.name}]`, () => {
		it("executes the test successfully", async () => {
			ModuleTestExtensions.reset();
			const config = createComposableApplication(newFileSystemModelLoader);
			await config.initialActions();

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
