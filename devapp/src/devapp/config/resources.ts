// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * Example of resource bundles. Each bundle holds the localized texts for a single language.
 *
 * In this simple example, the resources are manually written code. But they might also be generated (build time)
 * or loaded from JSON files (runtime).
 */

import type {
	LocalizationTree,
	LocalizationTreeMap
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";

const en: LocalizationTree = {
	application: {
		title: "Dev App"
	},
	version: {
		info: {
			currentVersion: {
				label: "Current Version"
			},
			dependencies: "Dependencies"
		}
	},
	cancel: "Cancel",
	settings: {
		title: "Settings"
	},
	dirtyHandling: {
		activity: {
			cancelled: "The activity has been cancelled.",
			kept: "You chose to keep the activity."
		}
	},
	vetoOnClose: "There are unsaved or locked activities.",
	theme: {
		title: "Theme",
		default: "Default",
		compact: "Compact",
		flat: "Flat",
		flat_compact: "Flat Compact"
	},
	language: {
		title: "Language"
	},
	devapp: {
		features: {
			"dirty-handling": {
				"cancel-success": "The changes have been discarded.",
				"cancel-abort": "Discarding the changes has been canceled."
			}
		}
	},
	examples: {
		about: {
			contact: {
				menuEntry: "Contact",
				locations: {
					berlin: `Torstrasse 164 can also be reached via Linienstrasse 98. Both addresses connect to the
							same courtyard. To reach our office, please use entrance B.`,
					hamburg: "Our Hamburg offices are located at the Hollaendischer Brook 2."
				}
			}
		},
		"data-handling": {
			"multiple-data-holders": {
				menu: "Multiple Data Holders",
				saved: "Data has been saved: $data$"
			},
			"saga-state-changes": {
				menu: "Saga State Changes"
			},
			heterogeneity: {
				"select-title": "Select variant"
			}
		},
		"ui-handling": {
			tabPanel: {
				minimize: "Minimize",
				maximize: "Maximize",
				close: "Close",
				informationPanel: {
					title: "Information"
				},
				searchPanel: {
					title: "Search",
					inputLabel: "Search Value",
					clearButton: "Clear Value",
					searchButton: "Search"
				}
			},
			customRegion: {
				menuEntry: "Custom Region"
			},
			customAppFrame: {
				menuLabel: "Application Frame Layout"
			},
			permissions: {
				menu: {
					entry: "Permissions",
					label: "$permission$",
					action: "Clicked on $permission$",
					chooser: "Permission Chooser"
				}
			},
			customLayout: {
				menuLabel: "Mobile Custom Layout"
			}
		},
		"dynamic-models": {
			menu: "Dynamic Models"
		}
	},
	"overview-engine": {
		"selected-documents": {
			title: "Selected persons",
			warning:
				"This modal is implemented in the devapp and does not come with the Overview Engine or client"
		}
	},
	server: {
		connection: {
			waiting: { title: "Waiting for server initialization", message: "Please wait..." },
			failed: { title: "Failed to connect to server", message: "Error: $ERROR$" }
		}
	}
};

const de: LocalizationTree = {
	application: {
		title: "Beispielanwendung"
	},
	version: {
		info: {
			currentVersion: {
				label: "Aktuelle Version"
			},
			dependencies: "Abhängigkeiten"
		}
	},
	cancel: "Abbrechen",
	settings: {
		title: "Einstellungen"
	},
	dirtyHandling: {
		activity: {
			cancelled: "Die Aktivität wurde beendet.",
			kept: "Sie haben entschieden, die Aktivität beizubehalten."
		}
	},
	vetoOnClose: "Es gibt ungespeicherte oder gesperrte Aktivitäten.",
	theme: {
		title: "Theme",
		default: "Standard",
		compact: "Kompakt",
		flat: "Flat",
		flat_compact: "Flat Kompakt"
	},
	language: {
		title: "Sprache"
	},
	devapp: {
		features: {
			"dirty-handling": {
				"cancel-success": "Die Änderungen wurden verworfen.",
				"cancel-abort": "Das Verwerfen der Änderungen wurde abgebrochen."
			}
		}
	},
	examples: {
		about: {
			contact: {
				menuEntry: "Kontakt",
				locations: {
					berlin: `Unsere Büros in der Torstraße 164 sind ebenfalls über die Linienstraße 98 zu
							erreichen. Beide Adressen führen auf den gleichen Innenhof. Um zu den mgm-Büros zu
							gelangen, bitte den Eingang B nehmen.`,
					hamburg: "Unsere Büroräume befinden sich im Holländischen Brook 2."
				}
			}
		},
		"data-handling": {
			"multiple-data-holders": {
				menu: "Mehrere Data Holders",
				saved: "Daten wurden gespeichert: $data$"
			},
			"saga-state-changes": {
				menu: "Saga-Zustandsänderungen"
			},
			heterogeneity: {
				"select-title": "Variante auswählen"
			}
		},
		"ui-handling": {
			tabPanel: {
				minimize: "Minimieren",
				maximize: "Maximieren",
				close: "Schließen",
				informationPanel: {
					title: "Information"
				},
				searchPanel: {
					title: "Suche",
					inputLabel: "Suchwert",
					clearButton: "Wert löschen",
					searchButton: "Suchen"
				}
			},
			customRegion: {
				menuEntry: "Custom Region"
			},
			customAppFrame: {
				menuLabel: "Application Frame Layout"
			},
			permissions: {
				menu: {
					entry: "Berechtigungen",
					label: "$permission$",
					action: "$permission$ ausgewählt",
					chooser: "Berechtigungen Auswählen"
				}
			},
			customLayout: {
				menuLabel: "Mobile Custom Layout"
			}
		},
		"dynamic-models": {
			menu: "Dynamische Modelle"
		}
	},
	"overview-engine": {
		"selected-documents": {
			title: "Selektiere Personen",
			warning:
				"Dieses Modal ist in der DevApp implementiert und ist nicht Teil der Overview Engine oder des Clients"
		}
	},
	server: {
		connection: {
			waiting: { title: "Warten auf Serverinitialisierung", message: "Bitte warten..." },
			failed: { title: "Verbindung zum Server fehlgeschlagen", message: "Fehler: $ERROR$" }
		}
	}
};

const SAMPLE_APPLICATION_TRANSLATIONS: LocalizationTreeMap = {
	en,
	de
};

export default SAMPLE_APPLICATION_TRANSLATIONS;
