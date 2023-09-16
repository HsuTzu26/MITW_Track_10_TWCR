const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-Practitioner",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-practitioner-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-practitioner-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Practitioner: {
        id: uuid["TWCR-Practitioner"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-practitioner-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
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
        target: "Practitioner.id",
        beforeConvert: (data) => {
            return `TWCR-Practitioner-${data}-${tool.getCurrentTimestamp()}`;
        },
    },
    {
        // 摘錄者 CISTCR22
        source: "CISTCR22",
        target: "Practitioner.identifier",
        beforeConvert: (data) => {
            let identifier = JSON.parse(`
            {
                "system" : "http://www.moi.gov.tw/",
                "value" : "KP00017"
            }
            `);
            identifier.value = data;

            return identifier;
        },
    },
];
