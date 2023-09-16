const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-PathologicStage",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-pathologic-stage-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-pathologic-stage-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-PathologicStage"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-pathologic-stage-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", // registered | preliminary | final | amended
        value: "Stage IA",
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "21902-2",
                    display: "Stage group.pathology Cancer",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`
        },
    },
};

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
    checkTWCR();
    // 在開始轉換前檢查TWCR的package是否有更新

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-PathologicStage-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //病理期別組合
        source: "PSG",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
                "valueCodeableConcept":{
                    "coding" : [
                        {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/pathologic-stage-group-codesystem",
                        "code" : "code",
                        "display" : "display"
                        }
                    ]
                }            
            }
            `);
            valueCodeableConcept.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON//CodeSystem-pathologic-stage-group-codesystem.json", data);
            valueCodeableConcept.valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
    {
        //AJCC癌症分期版本與章節
        source: "AJCCED",
        target: "Observation.method",
        beforeConvert: (data) => {
            let method = JSON.parse(`
            {
                "valueCodeableConcept":{
                    "coding" : [
                        {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR_LF/ValueSet-the-edition-and-chapter-of-AJCC-cancer-staging-valueset.html",
                        "code" : "code",
                        "display" : "display"
                        }
                    ]
                }
            }
            `);
            method.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON//CodeSystem-pathologic-stage-group-codesystem.json", data);
            method.valueCodeableConcept.coding[0].display = displayValue;

            return method;
        },
    },
];
