import fs from "fs";
import { parse } from "csv-parse/sync";
interface IErrorTextHelper {
    get(key: string): string;
    readParseCsv(path: string): void;
    dict: { [key: string]: string };
}

class ErrorTextHelper implements IErrorTextHelper {
    csvPath: string =
        "/Users/andersbusk/Programming/Codecademy/back-end-engineer-career-path/api-dev-with-swagger-and-openapi/personal_budget_2/src/utils/errors/Errors.csv";
    dict: { [key: string]: string };

    constructor() {
        this.dict = {};
        this.readParseCsv();
    }

    get(key: string): string {
        return this.dict[key];
    }

    set(key: string, value: string): void {
        this.dict[key] = value;
    }

    async readParseCsv(path: string = this.csvPath): Promise<void> {
        let dict: { [key: string]: string } = {};

        await fs.readFile(path, "utf8", (err: Error, data: string) => {
            if (err) throw err;
            let parsedData = parse(data, {
                skip_empty_lines: true,
                delimiter: ";",
            });

            for (let parsedRow of parsedData) {
                this.dict[parsedRow[0]] = parsedRow[1];
            }
        });
    }
}

export { ErrorTextHelper };
