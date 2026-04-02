import { listGeneratedForms } from "./src/lib/generatedFormsRegistry";

listGeneratedForms().then((res) => console.log(JSON.stringify(res, null, 2)));