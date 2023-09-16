const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-ImmunotherapyAtOtherFacility",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-targeted-therapy-at-other-facility-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-immunotherapy-at-other-facility-profile.profile.json.html

https: module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-ImmunotherapyAtOtherFacility"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-immunotherapy-at-other-facility-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
                    code: "OtherFacilityTargetedTherapy",
                    display: "外院標靶治療",
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
        target: "Procedure.id",
        beforeConvert: (data) => {
            return `TWCR-ImmunotherapyAtOtherFacility-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //外院免疫治療
        source: "IMAOF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let IMAOFCode = JSON.parse(`
            {
                "valueCodeableConcept" : {
                    "coding" : [
                        {
                            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/other-immunotherapy-codesystem",
                        "code" : "OtherFacilityTargetedTherapy",
                        "display" : "外院標靶治療"
                        }
                    ]
                }
            }
            `);
            IMAOFCode.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-other-immunotherapy-codesystem.json", data);
            IMAOFCode.valueCodeableConcept.coding[0].display = displayValue;

            return IMAOFCode;
        },
    },
];
