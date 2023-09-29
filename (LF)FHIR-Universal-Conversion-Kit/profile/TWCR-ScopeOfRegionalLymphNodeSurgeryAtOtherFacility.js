const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-ScopeOfRegionalLymphNodeSurgeryAtOtherFacility",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-scope-of-regional-lymph-node-surgery-at-other-facility-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-scope-of-regional-lymph-node-surgery-at-other-facility-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-ScopeOfRegionalLymphNodeSurgeryAtOtherFacility"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-scope-of-regional-lymph-node-at-other-facility-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
        },
        encounter: {
            reference: `Encounter/${uuid["TWCR-Encounter"]}`,
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
            return `TWCR-ScopeOfRegionalLymphNodeSurgeryAtOtherFacility-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //外院區域淋巴結手術範圍
        source: "SRLNSOF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let SRLNSOFCode = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-scope-of-regional-lymph-node-surgery-codesystem",
                      "code" : "1",
                      "display" : "執行區域淋巴結切片或抽吸"
                    }
                  ]
            }
            `);
            SRLNSOFCode.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-scope-of-regional-lymph-node-surgery-codesystem.json", data);
            SRLNSOFCode.coding[0].display = displayValue;

            return SRLNSOFCode;
        },
    },
];
