const app = require("../src/app"); // The key of running F.U.C.K. server
const postData = require("./data.json"); // The raw data that needed to POST to F.U.C.K.
const fuck = require("../src/lib/fuck/index");
const getProfilesName = require("./getProfilesName");

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

const Lorex = "https://hapi.fhir.tw/fhir/"; //Lorex
const internal1 = "http://152.38.3.102:8080/fhir/"; //內網1
const internal2 = "http://152.38.3.103:4180/fhir" //內網2

const fhirServer = Lorex;

// Running server and POST to F.U.C.K. then return the result of F.U.C.K. response
function runFuck(data, profileName) {
    // Start the F.U.C.K. server
    app;
    return new Promise((reslove, reject) => {
        let fuckConvert = new fuck.Convert(data, profileName);
        fuckConvert
            .convert()
            .then((res) => {
                if (res == undefined) {
                    console.log(profileName);
                    return reslove();
                } else {
                    return reslove(res);
                }
            })
            .catch((e) => {
                return reject(e);
            });
    });
}
/* 
    Problems: 
    **schema.definitions[resourceType].properties[fhirPath].type**
    has no type
*/

// Get all the profiles UUID
function getUUID(entry) {
    //Get uuid in profiles
    let resourcesUUID = [];

    for (let id in entry) {
        entry[id] !== undefined ? resourcesUUID.push(entry[id].id) : "Get UUID failed";
    }
    return resourcesUUID;
}

// Definition and Creating Composition profile
function createComposition(sectionEntry, compId = `${uuidv4()}`, status = "final", date = moment().format()) {
    //type: preliminary | final | amended | entered-in-error
    let composition = {
        resourceType: "Composition",
        id: compId,
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-composition-profile"],
        },
        text: {
            status: "generated",
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Composition</b><a name="CompositionExample"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Composition &quot;CompositionExample&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-twcr-sf-composition-profile.html">Composition</a></p></div><p><b>status</b>: final</p><p><b>type</b>: Cancer event report <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#72134-0)</span></p><p><b>date</b>: 2022-07-12 14:30:00+0800</p><p><b>author</b>: </p><ul><li><a href="Organization-OrganizationExample.html">Organization/OrganizationExample</a></li><li><a href="Practitioner-PractitionerExample.html">Practitioner/PractitionerExample</a></li></ul><p><b>title</b>: 癌症登記短表</p></div>',
        },
        status: status,
        type: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "72134-0",
                    display: "Cancer event report",
                },
            ],
        },
        subject: {
            reference: `Patient/${sectionEntry.Patient}`,
        },
        date: date,
        author: [
            {
                reference: `Organization/${sectionEntry.Organization}`,
            },
            {
                reference: `Practitioner/${sectionEntry.Practitioner}`,
            },
        ],
        title: "Cancer Registry Short Form",
        section: [
            {
                title: "The section of CancerConfirmation",
                code: {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: "395099008",
                            display: "Cancer confirmed (situation)",
                        },
                    ],
                },
                entry: [
                    { reference: `Encounter/${sectionEntry.Encounter}` },
                    { reference: `Condition/${sectionEntry.Condition}` },
                    { reference: `Condition/${sectionEntry.DateOfDiagnosisCondition}` },
                    { reference: `Condition/${sectionEntry.DateOfFirstMicroscopicConfirmation}` },
                    { reference: `Condition/${sectionEntry.PrimaryCancer}` },
                    { reference: `Observation/${sectionEntry.GradeClinical}` },
                    { reference: `Observation/${sectionEntry.GradePathological}` },
                    { reference: `Observation/${sectionEntry.TumorSize}` },
                    { reference: `Observation/${sectionEntry.PerineuralInvasion}` },
                    { reference: `Observation/${sectionEntry.LymphVascularInvasion}` },
                    { reference: `Observation/${sectionEntry.RegionalLymphNodesExamined}` },
                    { reference: `Observation/${sectionEntry.RegionalLymphNodesPositive}` },
                ],
            },
            {
                title: "The section of StageOfInitialDiagnosis",
                code: {
                    coding: [
                        {
                            system: "https://hapi.fhir.tw/fhir/CodeSystem/logical-model-codesystem",
                            code: "StageOfInitialDiagnosisOfCancer",
                            display: "StageOfInitialDiagnosisOfCancer",
                        },
                    ],
                },
                entry: [
                    { reference: `Procedure/${sectionEntry.SurgicalDiagnosticAndStagingProcedure}` },
                    { reference: `Procedure/${sectionEntry.SurgicalDiagnosticAndStagingProcedureAtOtherFacility}` },
                    { reference: `Observation/${sectionEntry.ClinicalT}` },
                    { reference: `Observation/${sectionEntry.ClinicalN}` },
                    { reference: `Observation/${sectionEntry.ClinicalM}` },
                    { reference: `Observation/${sectionEntry.ClinicalOtherStaging}` },
                    { reference: `Observation/${sectionEntry.ClinicalStage}` },
                    { reference: `Observation/${sectionEntry.ClinicalStageDescriptor}` },
                    { reference: `Observation/${sectionEntry.PathologicT}` },
                    { reference: `Observation/${sectionEntry.PathologicN}` },
                    { reference: `Observation/${sectionEntry.PathologicM}` },
                    { reference: `Observation/${sectionEntry.PathologicOtherStaging}` },
                    { reference: `Observation/${sectionEntry.PathologicStage}` },
                    { reference: `Observation/${sectionEntry.PathologicStageDescriptor}` },
                ],
            },
            {
                title: "The section of FirstCourseOfTreatment",
                code: {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: "708255002",
                            display: "First line treatment (procedure)",
                        },
                    ],
                },
                entry: [
                    { reference: `Procedure/${sectionEntry.FirstCourseOfTreatment}` },
                    { reference: `Procedure/${sectionEntry.FirstSurgicalProcedure}` },
                    { reference: `Procedure/${sectionEntry.SurgicalProcedureOfPrimarySite}` },
                    { reference: `Procedure/${sectionEntry.SurgicalProcedureOfPrimarySiteAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.MinimallyInvasiveSurgery}` },
                    { reference: `Observation/${sectionEntry.SurgicalMarginsOfThePrimarySite}` },
                    { reference: `Observation/${sectionEntry.SurgicalMarginsDistanceOfThePrimarySite}` },
                    { reference: `Procedure/${sectionEntry.ScopeOfRegionalLymphNodeSurgeryAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.ScopeOfRegionalLymphNodeSurgery}` },
                    { reference: `Procedure/${sectionEntry.SurgicalProcedureOtherSiteAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.SurgicalProcedureOtherSite}` },
                    { reference: `Procedure/${sectionEntry.ReasonForNoSurgeryOfPrimarySite}` },
                    { reference: `Procedure/${sectionEntry.RT}` },
                    { reference: `Procedure/${sectionEntry.SequenceOfRadiotherapyAndSurgery}` },
                    { reference: `Procedure/${sectionEntry.SequenceOfLocoregionalTherapyAndSystemicTherapy}` },
                    { reference: `Procedure/${sectionEntry.EBRTTechnique}` },
                    { reference: `Procedure/${sectionEntry.OtherRT}` },
                    { reference: `Procedure/${sectionEntry.SystemicTherapy}` },
                    { reference: `Procedure/${sectionEntry.Chemotherapy}` },
                    { reference: `Procedure/${sectionEntry.ChemotherapyAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.HormoneSteroidTherapy}` },
                    { reference: `Procedure/${sectionEntry.HormoneSteroidTherapyAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.Immunotherapy}` },
                    { reference: `Procedure/${sectionEntry.ImmunotherapyAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.HematologicTransplantEndocrineProcedure}` },
                    { reference: `Procedure/${sectionEntry.TargetedTherapy}` },
                    { reference: `Procedure/${sectionEntry.TargetedTherapyAtOtherFacility}` },
                    { reference: `Procedure/${sectionEntry.PalliativeCare}` },
                    { reference: `Procedure/${sectionEntry.OtherTreatment}` },
                ],
            },
            {
                title: "The section of OtherFactors",
                code: {
                    coding: [
                        {
                            system: "https://hapi.fhir.tw/fhir/CodeSystem/logical-model-codesystem",
                            code: "OtherFactors",
                            display: "OtherFactors",
                        },
                    ],
                },
                entry: [
                    { reference: `Observation/${sectionEntry.Height}` },
                    { reference: `Observation/${sectionEntry.Weight}` },
                    { reference: `Observation/${sectionEntry.SmokingBehavior}` },
                    { reference: `Observation/${sectionEntry.BetelNutChewingBehavior}` },
                    { reference: `Observation/${sectionEntry.DrinkingBehavior}` },
                    { reference: `Condition/${sectionEntry.AssessmentOfPerformanceStatusBeforeTreatment}` },
                ],
            },
            {
                title: "The section of Outcome",
                code: {
                    coding: [
                        {
                            system: "http://loinc.org",
                            code: "21976-6",
                            display: "Cancer outcome status",
                        },
                    ],
                },
                entry: {
                    reference: `Observation/${sectionEntry.FirstRecurrence}`,
                },
            },
            {
                title: "The section of SSF",
                code: {
                    coding: [
                        {
                            system: "https://hapi.fhir.tw/fhir/CodeSystem/logical-model-codesystem",
                            code: "SSF",
                            display: "Site-Specific Factor",
                        },
                    ],
                },
                entry: [
                    { reference: `Observation/${sectionEntry.SSF1}` },
                    { reference: `Observation/${sectionEntry.SSF2}` },
                    { reference: `Observation/${sectionEntry.SSF3}` },
                    { reference: `Observation/${sectionEntry.SSF4}` },
                    { reference: `Observation/${sectionEntry.SSF5}` },
                    { reference: `Observation/${sectionEntry.SSF6}` },
                    { reference: `Observation/${sectionEntry.SSF7}` },
                    { reference: `Observation/${sectionEntry.SSF8}` },
                    { reference: `Observation/${sectionEntry.SSF9}` },
                    { reference: `Observation/${sectionEntry.SSF10}` },
                ],
            },
        ],

        request: {
            method: "PUT",
            url: `Composition/${compId}`,
        },
    };

    return composition;
}

// Definition and Creating Bundle profile
function createBundle(entryData, bundleId = `${uuidv4()}`, type = "transaction", date = moment().format()) {
    let bundle = {
        resourceType: "Bundle",
        id: bundleId,
        identifier: {
            system: "https://www.cdc.gov.tw/",
            value: `TWCR-LF-${date}`, // 需要用什麼碼?還是自動生成?
        },
        type: type,
        timestamp: date,
        entry: entryData,
    };
    return bundle;
}

// The raw data that needed to POST to F.U.C.K.
let data = postData; // data: Object, type: JSON

(async () => {
    // 1.1 個別 Resource 上傳
    // Get the profile names
    const profiles = getProfilesName.getProfilesName();

    // Get the result of F.U.C.K. response
    let entry = [];
    for (let p of profiles) {
        entry.push(await runFuck(data, p));
    }

    /* Valid Number of profiles*/
    let PNum = 0;
    let ct = 0;
    for (e in entry) {
        entry[e].resourceType !== undefined ? ct++ : console.log(entry[e].resource);
    }
    console.log(ct, `Validation Number of profiles: ${profiles.length} Success`);
    PNum = ct;

    // 2. Composition 單獨上傳
    // Create Composition section entry
    const tmpProfiles = profiles.map((profile) => profile.split("TWCR-")[1]);
    const UUID = getUUID(entry);

    /* Valid UUID */
    let count = 0;
    for (let e in entry) {
        entry[e].id === UUID[e] ? count++ : console.log(entry[e]);
    }
    console.log(count, `Validation UUID: ${profiles.length} Success`);

    const sectionEntry = {};
    tmpProfiles.map((profile, index) => (sectionEntry[profile] = UUID[index]));

    // Create SectionEntry.json
    const sectionEntryPath = __dirname + "/SectionEntry.json";
    const sectionEntryJson = JSON.stringify(sectionEntry, null, 4);
    fs.writeFileSync(sectionEntryPath, sectionEntryJson, "utf-8", (e) => {
        if (e) {
            console.log(e);
            return;
        }
    });

    let Composition = createComposition(sectionEntry);

    const CompId = Composition.id;
    // Composition POST to FHIR server
    const hapiCompURL = `${fhirServer}Composition/${CompId}`;
    const postCompHapi = axios.put(hapiCompURL, Composition);
    postCompHapi
        .then((res) => (Composition = res.data))
        .catch((e) => {
            console.log(e.response.data);
        });
    console.log("***Completely create Composition***");
    PNum++;

    // save Composition
    const CompositionPath = path.join(__dirname, "../JSONPlaceholder/Composition.json");
    const CompositionJson = JSON.stringify(Composition, null, 4);
    fs.writeFileSync(CompositionPath, CompositionJson, "utf-8", (e) => {
        if (e) {
            console.log(e);
            return;
        }
    });

    delete Composition.request;

    // 3. Bundle document 上傳
    // Put Composition profile into entry
    entry.unshift(Composition);

    // Process: delete request
    for (e in entry) {
        delete entry[e].request;
    }

    // Create resource
    for (let e in entry) {
        let resource = [{ resource: entry[e] }];
        entry[e] = resource[0];
    }

    let BundleDocument = createBundle(entry);

    BundleDocument.type = "document";

    // save Bundle document
    const BundleDocumentPath = path.join(__dirname, "../JSONPlaceholder/BundleDocument.json");
    const BundleDocumentJson = JSON.stringify(BundleDocument, null, 4);
    fs.writeFileSync(BundleDocumentPath, BundleDocumentJson, "utf-8", (e) => {
        if (e) {
            console.log(e);
            return;
        }
    });

    const hapiBundlePutURL = `${fhirServer}Bundle/${BundleDocument.id}`;
    const putBundleHapi = axios.put(hapiBundlePutURL, BundleDocument);

    putBundleHapi
        .then((res) => (BundleDocument = res))
        .catch((e) => {
            console.log(e.response.data);
        });

    console.log("***Completely create Bundle document***");
    PNum++;

    /* Final Check */
    PNum === 75 + 2 ? console.log(PNum, `Validation Long Form Profiles: ${PNum} Success`) : "Validation Failed";
})();
