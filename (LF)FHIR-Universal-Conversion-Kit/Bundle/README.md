* MITW 上傳 Bundle 參測流程
1. 個別 Resource 上傳 or Bundle transaction 上傳 (meta 裡面放各賽道之 StructureDefinition)
    * 取得各 Resource UUID
2. Composition 單獨上傳
    * 取得 Composition UUID
3. Bundle document 上傳



* 北榮 程式流程
1.  取得個別 Resource 的檔案名稱 (getProfilesName.js)
    * 注意 Resource 上傳順序 
    (Organization, Patient, Practitioner, Encounter)
2.  取得 F.U.C.K.回應的結果 (FHIR 格式資料)
3.  建立關聯 
    (Organization, Patient, Practitioner, Encounter)
4.  建立 Bundle transaction 並上傳至 FHIR Server
    * Request method: POST
    * URL: htpps://hapi.fhir.tw/fhir/
    * request:
    {
       method: POST
       url: ${resourceType}/${Resource UUID} 
    }
5.  取得各 Resource UUID
6.  建立 Composition 並上傳至 FHIR Server
7.  取得 Composition UUID
8.  建立 Bundle document 並上傳至 FHIR Server
    * Request method: PUT
    * URL: https://hapi.fhir.tw/fhir/Bundle/${BundleID}
