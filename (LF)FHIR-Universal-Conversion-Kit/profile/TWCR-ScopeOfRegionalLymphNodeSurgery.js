const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-ScopeOfRegionalLymphNodeSurgery",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-scope-of-regional-lymph-node-surgery-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-scope-of-regional-lymph-node-surgery-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-ScopeOfRegionalLymphNodeSurgery"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-scope-of-regional-lymph-node-surgery-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
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
        target: "Procedure.id",
        beforeConvert: (data) => {
            return `TWCR-ScopeOfRegionalLymphNodeSurgery-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //申報醫院區域淋巴結手術範圍
        source: "SRLNSTF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let SRLNSTFCode = JSON.parse(`
            {
                "valueCodeableConcept" : {
                    "coding" : [
                        {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/scope-of-regional-lymph-node-surgery-codesystem",
                        "code" : "code",
                        "display" : "display"
                        }
                    ]
                }
            }
            `);
            SRLNSTFCode.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-scope-of-regional-lymph-node-surgery-codesystem.json", data);
            SRLNSTFCode.valueCodeableConcept.coding[0].display = displayValue;

            return SRLNSTFCode;
        },
    },
];
