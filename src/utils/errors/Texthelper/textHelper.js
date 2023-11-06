var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import { parse } from "csv-parse/sync";
class ErrorTextHelper {
    constructor() {
        this.csvPath = "/Users/andersbusk/Programming/Codecademy/back-end-engineer-career-path/api-dev-with-swagger-and-openapi/personal_budget_2/src/utils/errors/Errors.csv";
        this.dict = {};
        this.readParseCsv();
    }
    get(key) {
        return this.dict[key];
    }
    set(key, value) {
        this.dict[key] = value;
    }
    readParseCsv(path = this.csvPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let dict = {};
            yield fs.readFile(path, "utf8", (err, data) => {
                if (err)
                    throw err;
                let parsedData = parse(data, {
                    skip_empty_lines: true,
                    delimiter: ";",
                });
                for (let parsedRow of parsedData) {
                    this.dict[parsedRow[0]] = parsedRow[1];
                }
            });
        });
    }
}
export { ErrorTextHelper };
