const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    id: uuid["TWCR-Organization"],
    name: "TWCR-Organization",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-organization-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-organization-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Organization: {
        id: uuid["TWCR-Organization"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-organization-profile"],
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
        target: "Organization.id",
        beforeConvert: (data) => {
            return `TWCR-Organitzation-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 申報醫院代碼	HOSCODE	identifier(identifier.value)
        source: "HOSCODE",
        target: "Organization.identifier",
        beforeConvert: (data) => {
            let identifier = JSON.parse(`
            
                {
                    "value" : "0000016"
                }
            
            `);

            identifier.value = String(data);
            
            return identifier;
        },
    },
];
