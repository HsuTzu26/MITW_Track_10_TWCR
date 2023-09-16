# For 2023 MITW Track10 TWCR use

Reference from FHIR Universal Conversion Kit (F.U.C.K.)

Ref: <https://github.com/Lorex/FHIR-Universal-Conversion-Kit-Project-F.U.C.K.->

### Summary
    Using fuck entry result to put into bundle, 
    then replace postman to self-definition program, 
    automatically realize POST and create bundle.

#### The Process of Track 10
1. Individual Resource upload or Bundle transaction upload (meta contains the StructureDefinition of each track)
    * Get each Resource UUID
2. Composition uploaded separately
     * Get Composition UUID
3. Bundle document upload

--------------------
1. *Transform json formation to FHIR formation with F.U.C.K.*
- [x] Short Form Profile (templates)
- [x] Long Form Profile (templates)
2. *Create Bundle*
- [x] Use axios to post data to F.U.C.K. server
    - [x] Individual Resource upload (Ensure that resources are uploaded in the correct order)
    - [x] Get result of F.U.C.K. response (Comforms to FHIR format)
          
          Push into bundle with all profiles => transaction (Non-essential)
- [x] Create Composition profile and reference
    - [x] Get all of the profile uuid
    - [x] Create Composition profile
    - [x] Put Composition profiles first in Bundle
- [x] Completely create bundle
    (**Including composition, resources, create references**)
3. POST to cylab FHIR Server
- [x] Check bundle whether meet the FHIR formation
- [x] POST to FHIR Server, be sure no problem

#### ##Check##
- [x] Create automated F.U.C.K. execution
- [x] Completely create references
- [x] Could use PUT method to upload FHIR server
- [x] Could use get to obtain information from a resource
