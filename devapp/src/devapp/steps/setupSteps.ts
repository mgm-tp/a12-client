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

import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import type { ActionSequence } from "./ActionSequence.js";
import type { StateHistory } from "./factories.js";
import { SequencesProcessor } from "./SequencesProcessor.js";
import { stepTestActionSequences } from "./stepTestActionSequences.js";

interface CustomWindow extends Window {
	steps: ConsoleSteps;
}

declare const window: CustomWindow;

const logger = LoggerFactory.getLogger("extensions/steps");

interface ConsoleSteps {
	runAll(pauseTimeInSeconds: number): void;
	readonly [key: string]:
		{ run(pauseTimeInSeconds: number): void } | ((pauseTimeInSeconds: number) => void);
}

export function setupSteps(store: Store<object>, stateHistory: StateHistory): void {
	const sequencesProcessor = new SequencesProcessor(
		stepTestActionSequences,
		store,
		stateHistory,
		currentStepDescription => {
			handleStepDescriptionChange(currentStepDescription);
		},
		currentSequenceDescription => {
			handleSequenceDescriptionChange(currentSequenceDescription);
		}
	);

	function runSteps(sequenceNumber: number, pauseTimeInSeconds = 0) {
		sequencesProcessor.runSequence(sequenceNumber, pauseTimeInSeconds * 1000).catch(error => {
			processReject(error);
		});
	}

	function runAllSteps(pauseTimeInSeconds = 0) {
		sequencesProcessor.runAllSequences(pauseTimeInSeconds * 1000).catch(error => {
			processReject(error);
		});
	}

	const initialSteps: ConsoleSteps = {
		runAll: (pauseTimeInSeconds = 0) => {
			runAllSteps(pauseTimeInSeconds);
		}
	};

	const steps: ConsoleSteps = stepTestActionSequences.reduce(
		(obj: ConsoleSteps, sequence: ActionSequence, index: number) => ({
			...obj,
			[sequence.name]: {
				run: (pauseTimeInSeconds = 0) => {
					runSteps(index, pauseTimeInSeconds);
				}
			}
		}),
		initialSteps
	);

	window.steps = steps;
}

/* eslint-disable no-console */
function handleStepDescriptionChange(value: string) {
	const style = value === "Success" ? "color: green;" : "";
	console.log(`%c ${value}`, style);

	if (value === "Success") {
		console.groupEnd();
	}
}

function handleSequenceDescriptionChange(value: string) {
	console.group(value);
}

function processReject(error: Error): void {
	logger.error(error);

	console.groupEnd();
}
