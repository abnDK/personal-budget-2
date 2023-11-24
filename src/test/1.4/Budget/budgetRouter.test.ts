// a component test to verify that we get correct feedback from the budget route.
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { Budget } from "../../../models/1.4/budget.js";
import { Category } from "../../../models/1.4/category.js";
import { Period } from "../Utils/period.js";

chai.use(chaiHttp);
const BASEURL = "http://localhost:3000";
const ROUTE = "budget";
const TESTBUDGET_A_ID = 1;
const TESTBUDGET_B_ID = 2;
const TESTBUDGET_C_ID = 3;

// functions
const testValue2 = (target: any, goal: any, paramName?: string) => {
    switch (typeof goal) {
        case "string":
            it(`should be a string`, () => {
                expect(target).to.be.a("string");
            });
            it(`should be equal to "${goal}"`, () => {
                expect(target).to.deep.equal(goal);
            });

            break;
        case "number":
            it(`should be a number`, () => {
                expect(target).to.be.a("number");
            });
            it(`should be equal to "${goal}"`, () => {
                expect(target).to.deep.equal(goal);
            });

            break;
        case "boolean":
            it(`should be a boolean`, () => {
                expect(target).to.be.a("boolean");
            });
            it(`should be equal to "${goal}"`, () => {
                expect(target).to.deep.equal(goal);
            });

            break;
        default:
            if (Array.isArray(target)) {
                it(`should be an array`, () => {
                    expect(target).to.be.an("array");
                });
                it(`should be equal to an array with values [${goal.join(
                    ", "
                )}]`, () => {
                    expect(target).to.have.members(goal);
                });

                it(`should return an array of length ${goal.length}`, () => {
                    expect(target).to.have.lengthOf(goal.length);
                });
            } else {
                console.log(target + " is an unknown type");
            }
    }
};

const testValue = (target: any, goal: any, paramName?: string) => {
    switch (typeof goal) {
        case "string":
            // describe(`Testing ${paramName ? paramName : target}`, () => {
            it(`should return a string`, () => {
                expect(target).to.be.a("string");
            });
            it(`should return "${goal}"`, () => {
                expect(target).to.deep.equal(goal);
            });
            // });

            break;
        case "number":
            // describe(`Testing ${paramName ? paramName : target}`, () => {
            it(`should return a number`, () => {
                expect(target).to.be.a("number");
            });
            it(`should return ${goal}`, () => {
                expect(target).to.deep.equal(goal);
            });
            // });
            break;
        case "boolean":
            // describe(`Testing ${paramName ? paramName : target}`, () => {
            it(`should return a boolean`, () => {
                expect(target).to.be.an("boolean");
            });
            it(`should return ${goal}`, () => {
                expect(target).to.deep.equal(goal);
            });
            // });
            break;

        default:
            if (Array.isArray(target)) {
                // describe(`Testing ${paramName ? paramName : target}`, () => {
                it(`should return an array`, () => {
                    expect(target).to.be.an("array");
                });
                it(`should return array with values [${goal.join(
                    ", "
                )}]`, () => {
                    expect(target).to.have.members(goal);
                });

                it(`should return array of length ${goal.length}`, () => {
                    expect(target).to.have.lengthOf(goal.length);
                });
                // });
            } else {
                console.log(target + " is an unknown type");
            }
    }
};

const testObject2 = (targetObject: any, goalObject: any, testname?: string) => {
    for (let [goalKey, goalValue] of Object.entries(goalObject)) {
        describe(`Testing attribute: ${goalKey}`, () => {
            if (goalValue) {
                it(`should have property "${goalKey}"`, () => {
                    expect(targetObject).to.have.property(goalKey);
                });
                testValue2(targetObject[goalKey], goalValue, goalKey);
            } else {
                it(`should not have property "${goalKey}"`, () => {
                    // if entry in goal is undefined, it's expected not to be on target objectd
                    expect(targetObject).to.not.have.property(goalKey);
                });
            }
        });
    }
};

const testObject = (targetObject: any, goalObject: any, testname?: string) => {
    describe(testname ? testname : "Testing an object:", () => {
        describe(`Testing {${Object.keys(targetObject).join(", ")}}`, () => {
            for (let [goalKey, goalValue] of Object.entries(goalObject)) {
                if (goalValue) {
                    it(`should have property ${goalKey}`, () => {
                        expect(targetObject).to.have.property(goalKey);
                        testValue(targetObject[goalKey], goalValue, goalKey);
                    });
                } else {
                    it(`should not have property ${goalKey}`, () => {
                        // if entry in goal is undefined, it's expected not to be on target object
                        expect(targetObject).to.not.have.property(goalKey);
                    });
                }
            }
        });
    });
};

const testResponseHeaders = (
    response: any,
    goalObject: any,
    url: string = ""
) => {
    describe(url, () => {
        describe(`Testing headers`, () => {
            // get
            const statuscode = response.status;
            const contentType = response.header["content-type"].split(";")[0];
            // verify
            describe("aaa", () => {
                testValue(statuscode, goalObject.statuscode, "Statuscode2");
            });
            describe("bbb", () => {
                testValue(contentType, goalObject.contentType, "Content-type");
            });
        });
    });
};

/* const makeChaiRequest = (
    // DOES NOT WORK....
    httpMethod: string,
    baseUrl: string,
    route: string,
    params?: string[] | undefined,
    payload?: Object
): any => {
    // build query with pot. params
    let queryString: string = route;

    for (let param of params) {
        queryString += `/${param.toLowerCase()}`;
    }
    console.log(queryString);

    httpMethod = httpMethod.toLowerCase();

    let response;

    switch (httpMethod) {
        case "GET":
            console.log("getting...");
            console.log(baseUrl);
            console.log(queryString);
            it("a", () => {
                return chai.request(baseUrl).get(queryString);
            });

            break;
        case "POST":
            response = chai.request(baseUrl).post(queryString).send(payload);
            break;
        default:
            throw new Error(
                `Could not recoqnize http method for requesting the server ${baseUrl}/${queryString}`
            );
    }
}; */

describe("GET /budget", () => {
    it("Should return status 200", async () => {
        // get
        let response = await chai.request(BASEURL).get("/budget");

        // manipulate

        // verify
        expect(response.status).to.eql(200);
    });
    it("Should return content-type: application/json", async () => {
        // get
        let response = await chai.request(BASEURL).get("/budget");

        // manipulate
        let contentType = response.header["content-type"].split(";")[0];
        // verify
        expect(contentType).to.equal("application/json");
    });
    it("Should return budget named testbudget_a", async () => {
        // get
        let response = await chai.request(BASEURL).get("/budget");

        // manipulate
        let budgets = response.body;
        let budget = budgets.filter((b) => b.name === "testbudget_a")[0];

        // verify
        expect(budget.name).to.equal("testbudget_a");
    });
    it("Should return budget named testbudget_b", async () => {
        // get
        let response = await chai.request(BASEURL).get("/budget");

        // manipulate
        let budgets = response.body;
        let budget = budgets.filter((b) => b.name === "testbudget_b")[0];

        // verify
        expect(budget.name).to.equal("testbudget_b");
    });
    it("Should return budget named testbudget_c", async () => {
        // get
        let response = await chai.request(BASEURL).get("/budget");

        // manipulate
        let budgets = response.body;
        let budget = budgets.filter((b) => b.name === "testbudget_c")[0];

        // verify
        expect(budget.name).to.equal("testbudget_c");
    });
});

describe("GET /budget/:id", () => {
    describe("testbudget_a", () => {
        it("Should return status 200", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_A_ID);

            // manipulate

            // verify
            expect(response.status).to.eql(200);
        });
        it("Should return content-type: application/json", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_A_ID);

            // manipulate
            let contentType = response.header["content-type"].split(";")[0];
            // verify
            expect(contentType).to.equal("application/json");
        });
        it("Should return budget named testbudget_a", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_A_ID);
            // manipulate
            let budget = response.body;

            // verify
            expect(budget.name).to.equal("testbudget_a");
        });
        it("Should return budget with 1 root element", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_A_ID);
            // manipulate
            let root = response.body.root;

            // verify
            expect(root).to.have.length(1);
        });
        it("Should return budget with 1 root element name A5x", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_A_ID);
            // manipulate
            let root = response.body.root;
            let root_element = root[0];

            // verify
            expect(root_element.name).to.equal("A5x");
        });
        it("Should return budget with 1 root element with end of life = true", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);
            // manipulate
            let root = response.body.root;
            let root_element = root[0];

            // verify
            expect(root_element.endOfLife).to.be.true;
        });
    });
    describe("testbudget_b", () => {
        it("Should return status 200", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);

            // manipulate

            // verify
            expect(response.status).to.eql(200);
        });
        it("Should return content-type: application/json", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);

            // manipulate
            let contentType = response.header["content-type"].split(";")[0];
            // verify
            expect(contentType).to.equal("application/json");
        });
        it("Should return budget named testbudget_b", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);
            // manipulate
            let budget = response.body;

            // verify
            expect(budget.name).to.equal("testbudget_b");
        });
        it("Should return budget with 1 root element", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);

            // manipulate
            let root = response.body.root;

            // verify
            expect(root).to.be.an("array").and.have.lengthOf(1);
        });
        it("Should return budget with 1 root element name A3x", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);

            // manipulate
            let root = response.body.root;
            let root_element = root[0];

            // verify
            expect(root_element.name).to.equal("A3x");
        });
        it("Should return budget with 1 root element with end of life = true", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);

            // manipulate
            let root = response.body.root;
            let root_element = root[0];

            // verify
            expect(root_element.endOfLife).to.be.true;
        });
    });
    describe("testbudget_c", () => {
        it("Should return status 200", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_C_ID);

            // manipulate

            // verify
            expect(response.status).to.eql(200);
        });
        it("Should return content-type: application/json", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_C_ID);

            // manipulate
            let contentType = response.header["content-type"].split(";")[0];
            // verify
            expect(contentType).to.equal("application/json");
        });
        it("Should return budget named testbudget_c", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_C_ID);
            // manipulate
            let budget = response.body;

            // verify
            expect(budget.name).to.equal("testbudget_c");
        });
        it("Should return budget with 1 root element", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_C_ID);
            // manipulate
            let root = response.body.root;

            // verify
            expect(root).to.be.an("array").and.have.lengthOf(1);
        });
        it("Should return budget with 1 root element name A3", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_C_ID);
            // manipulate
            let root = response.body.root;
            let root_element = root[0];

            // verify
            expect(root_element.name).to.equal("A3");
        });
        it("Should return budget with 1 root element with end of life = false", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_C_ID);
            // manipulate
            let root = response.body.root;
            let root_element = root[0];

            // verify
            expect(root_element.endOfLife).to.be.false;
        });
    });
});
describe("GET /budget/:id/:year/:month", () => {
    const HTTPMETHOD = "GET";
    describe("testbudget_a", () => {
        const BUDGETNAME = "testbudget_a";
        const BUDGETID = TESTBUDGET_A_ID;
        const STATUSCODE = 200;
        const CONTENTTYPE = "application/json";

        describe("period 0 - testing params", () => {
            /**
             * TEST OF PERIOD 0:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_0();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A1";
            const ROOTELEMENTAMOUNT = 1;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["abe"];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 1 - testing params", () => {
            /**
             * TEST OF PERIOD 1:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_1();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A3x";
            const ROOTELEMENTAMOUNT = 3;
            const ROOTELEMENTENDOFLIFE = true;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["FIX IT!"];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 2 - testing params", () => {
            /**
             * TEST OF PERIOD 2:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_2();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A4 (A3)";
            const ROOTELEMENTAMOUNT = 4;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["FIX IT!"];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 3 - testing params", () => {
            /**
             * TEST OF PERIOD 3:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_3();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A2";
            const ROOTELEMENTAMOUNT = 2;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["FIX IT!"];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 4 - testing params", () => {
            /**
             * TEST OF PERIOD 3:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_4();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A5x";
            const ROOTELEMENTAMOUNT = 5;
            const ROOTELEMENTENDOFLIFE = true;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["FIX IT!"];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
    });
    describe("testbudget_c", () => {
        const BUDGETNAME = "testbudget_c";
        const BUDGETID = TESTBUDGET_C_ID;
        const STATUSCODE = 200;
        const CONTENTTYPE = "application/json";

        describe.only("Test return object", () => {
            testObject2(
                {
                    name: "anders",
                    horse: "not undefined",
                    party: "5",
                    cow: [1, 2, 3],
                    jaNej: false,
                },
                {
                    name: "anders",
                    horse: undefined,
                    party: 5,
                    cow: ["a", "b", "c"],
                    jaNej: true,
                }
            );
        });

        describe("period 0 - testing params", () => {
            /**
             * TEST OF PERIOD 0:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_0();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A1";
            const ROOTELEMENTAMOUNT = 1;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["abe"];
            const ROOTELEMENTNEXT = undefined;
            const ROOTELEMENTPREV = undefined;

            const EXPECTED = {
                budgetName: BUDGETNAME,
                budgetId: BUDGETID,
                rootElementLength: ROOTELEMENTLENGTH,
                rootElementName: ROOTELEMENTNAME,
                rootElementAmount: ROOTELEMENTAMOUNT,
                rootElementEndOfLife: ROOTELEMENTENDOFLIFE,
                rootElementParent: ROOTELEMENTPARENT,
                rootElementChildrenLength: ROOTELEMENTCHILDRENLENGTH,
                rootElementChildrenNames: ROOTELEMENTCHILDRENNAMES,
                rootElementNext: ROOTELEMENTNEXT,
                rootElementPrev: ROOTELEMENTPREV,
            };

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            describe("testing headers", async () => {
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                testResponseHeaders(response, {
                    statuscode: STATUSCODE,
                    contentType: CONTENTTYPE,
                });
            });

            describe("testing body", async () => {
                let response = await chai.request(BASEURL).get(QUERYSTRING);

                const target = response.body;

                testObject(
                    {
                        budgetName: target.name,
                        budgetId: target.id,
                        rootElementLength: target.root.length,
                        rootElementName: target.root[0].name,
                        rootElementAmount: target.root[0].name,
                        rootElementEndOfLife: target.root[0].endOfLife,
                        rootElementParent: target.root[0].parent,
                        rootElementChildrenLength: target.root[0].children,
                        rootElementChildrenNames: target.root[0].children.map(
                            (child) => child.name
                        ),
                        rootElementNext: target.root[0].next,
                        rootElementPrev: target.root[0].prev,
                    },
                    EXPECTED,
                    "test de test"
                );
            });
            /* 
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            }); */
        });
        describe("period 0", () => {
            /**
             * TEST OF PERIOD 0:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_0();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A1";
            const ROOTELEMENTAMOUNT = 1;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["abe"];
            const ROOTELEMENTNEXT = undefined;
            const ROOTELEMENTPREV = undefined;

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 1", () => {
            /**
             * TEST OF PERIOD 1:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_1();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A1";
            const ROOTELEMENTAMOUNT = 1;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 0;
            const ROOTELEMENTCHILDRENNAMES = ["FIX IT!"];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 2", () => {
            /**
             * TEST OF PERIOD 2:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_2();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A2";
            const ROOTELEMENTAMOUNT = 2;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 1;
            const ROOTELEMENTCHILDRENNAMES = [
                "FIX IT!",
                "but should be B1",
                "B1",
            ];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 3", () => {
            /**
             * TEST OF PERIOD 3:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_3();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A2";
            const ROOTELEMENTAMOUNT = 2;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 2;
            const ROOTELEMENTCHILDRENNAMES = [
                "FIX IT!",
                "but should be B2 and C1",
                "B1",
            ];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
        describe("period 4", () => {
            /**
             * TEST OF PERIOD 3:
             * statuscode of response
             * content-type of response
             * budget name
             * budget id
             * amount of root elements
             * for rootelement:
             *      name
             *      amount
             *      endOfLife
             *      parent
             *      children.length
             *      children names
             *      no next
             *      no prev
             */

            const PERIOD = Period.period_4();
            const ROOTELEMENTLENGTH = 1;
            const ROOTELEMENTNAME = "A3";
            const ROOTELEMENTAMOUNT = 3;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENLENGTH = 3;
            const ROOTELEMENTCHILDRENNAMES = [
                "FIX IT!",
                "but should be B1, C1 and D1",
                "B1",
            ];

            it(`Should return status ${STATUSCODE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let contentType = response.header["content-type"].split(";")[0];
                // verify
                expect(contentType).to.equal(CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
            });
            it(`should return budget with only ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            it(`should return budget with root element named ${ROOTELEMENTNAME}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.name).to.equal(ROOTELEMENTNAME);
            });
            it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
            });
            it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE}`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTENDOFLIFE
                    ? expect(element.endOfLife).to.be.true
                    : expect(element.endOfLife).to.be.false;
            });
            it(`should return budget with root element that has ${
                ROOTELEMENTPARENT ? "a" : "no"
            } parent`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTPARENT
                    ? expect(element).to.have.property("parent")
                    : expect(element).to.not.have.property("parent");

                ROOTELEMENTPARENT
                    ? expect(element.parent.name).to.equal(ROOTELEMENTPARENT)
                    : false;
            });
            it(`should return budget with root element that has ${ROOTELEMENTCHILDRENLENGTH} children`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                ROOTELEMENTCHILDRENLENGTH
                    ? expect(element.children)
                          .to.be.an("array")
                          .with.lengthOf(ROOTELEMENTCHILDRENLENGTH)
                    : expect(element).to.not.have.property("children");
            });
            it(`FIX THIS! should return budget with root element that has ${
                ROOTELEMENTCHILDRENNAMES.length
                    ? "children named " + ROOTELEMENTCHILDRENNAMES.join(", ")
                    : "no children"
            }`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0]; // works only for first element in root

                // verify
                element?.children?.length // THIS DOES NOT WORK WITH
                    ? expect(
                          element.children.map((child) => child.name)
                      ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                    : expect(element).to.not.have.property("children");
                expect(true).to.be.false;
            });
            it(`should return budget with root element that has no next or nextid element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("next");
                expect(element).to.not.have.property("nextId");
            });
            it(`should return budget with root element that has no prev or prevId element`, async () => {
                // get
                let response = await chai
                    .request(BASEURL)
                    .get(
                        "/budget/" +
                            BUDGETID +
                            "/" +
                            PERIOD.getFullYear() +
                            "/" +
                            String(PERIOD.getMonth() + 1).padStart(2, "0")
                    );
                // manipulate
                let budget = response.body;
                let element = budget.root[0];

                // verify
                expect(element).to.not.have.property("prev");
                expect(element).to.not.have.property("prevId");
            });
        });
    });
});

interface TestStep {
    requestType: string;
    route: string;
    date: Period;
    expectedResultInText: string;
    expectedResult: Budget;
}

interface StaticTestConfig {
    testName: string;
    testData: Budget;
    testSteps: Array<TestStep>;
}

const runStaticTest = (step: TestStep, context?: { budgetId?: number }) => {
    console.log("runStaticTest called...");
    it(`${step.requestType} ${step.route} with date ${step.date}\n ${step.expectedResultInText}`, (done) => {
        console.log("inside first describe block...");

        chai.request(BASEURL)
            .get(step.route)
            .end((err, res) => {
                expect(res.status).to.eql(200);
                const result = JSON.parse(res.text);
                const budgetNames = result.map((budget) => budget.name);

                expect(budgetNames).to.include("testbudget_a");
                expect(budgetNames).to.include("testbudget_b");
                expect(budgetNames).to.include("testbudget_c");

                const budgetNameAndRoot = result.map((budget) => {
                    return { name: budget.name, root: budget.root };
                });
                //console.log(budgetNameAndRoot);
                expect(budgetNameAndRoot)
                    .to.be.an("array")
                    .that.deep.includes({
                        name: "testbudget_a",
                        root: [
                            "TODO: should contain something - a Category object at least",
                        ],
                    });
                console.log(JSON.parse(res.text));
                done();
            });
    });
};

const runStaticTestScenario = (testConfig: StaticTestConfig): void => {
    // before: set up testConfig.testData
    let budgetId: number;
    before(() => {
        console.log("about to insert budget, if any");

        /* .then((budget) => {
                budgetId = budget?.id;

                let newCatsPromises = testConfig.testData.categories?.map(
                    (cat) => {
                        return CategoryService.createCategory(
                            cat.name,
                            cat.amount,
                            cat.endOfLife,
                            cat.createDate,
                            budgetId,
                            cat.prevId,
                            cat.nextId,
                            cat.parentId
                        ).then(() => {});
                    }
                );

                return Promise.all(newCatsPromises);
            })
            .catch((err) => {
                throw err;
            }); */
    });

    console.log("runStaticTestScenario called...");
    describe(testConfig.testName, () => {
        for (let step of testConfig.testSteps) {
            runStaticTest(step);
        }
    });
    /* 
    describe(testConfig.testSteps.route, () => {
        describe(testConfig.testSteps.requestType, () => {
            it("Shold return list of all budgets", () => {
                chai.request("http://localhost:3000")
                    .get("/budgets")
                    .end((err, res) => {
                        //console.log(err);
                        console.log(Object.getOwnPropertyNames(res));
                        console.log(res.text);
                        console.log(res._body);
                        console.log(JSON.parse(res.text));
                        let body = JSON.parse(res.text);
                        chai.expect(body[0].name)
                            .to.be.a("string")
                            .that.equal("testbudget_a");
                        chai.expect(body[1].name)
                            .to.be.a("string")
                            .that.equal("testbudget_b");
                    });
            });
        });
    }); */
};

const runStaticTestSuite = () => {
    // gather all 3 scenarios in this...
};

const test_static_budget_1 = new Budget(
    "test_static_budget_1",
    Period.period_0(),
    "tester",
    1
);
test_static_budget_1.categories = [
    new Category(
        "A1",
        1,
        false,
        Period.period_0_medio(),
        1,
        1,
        undefined, // prevId
        3, // nextId
        undefined, // parentId
        undefined // childrenIds
    ),
    new Category(
        "A2",
        2,
        false,
        Period.period_3_medio(),
        2,
        1,
        4, // prevId
        5, // nextId
        undefined, // parentId
        undefined // childrenIds
    ),
    new Category(
        "A3x",
        1,
        true,
        Period.period_1(),
        3,
        1,
        1, // prevId
        4, // nextId
        undefined, // parentId
        undefined // childrenIds
    ),
    new Category(
        "A4 (A3)",
        1,
        false,
        Period.period_2(),
        4,
        1,
        3, // prevId
        2, // nextId
        undefined, // parentId
        undefined // childrenIds
    ),
    new Category(
        "A5x",
        0,
        true,
        Period.period_4_medio(),
        5,
        1,
        2, // prevId
        undefined, // nextId
        undefined, // parentId
        undefined // childrenIds
    ),
];

const test_static_budget_1_period_0 = new Budget(
    "test_static_budget_1",
    Period.period_0(),
    "tester",
    1
);

test_static_budget_1_period_0.categories =
    test_static_budget_1.categories.filter(
        (cat) => cat.createDate <= Period.period_0()
    );

const test_static_budget_1_period_1 = new Budget(
    "test_static_budget_1",
    Period.period_1(),
    "tester",
    1
);

test_static_budget_1_period_1.categories =
    test_static_budget_1.categories.filter(
        (cat) => cat.createDate <= Period.period_1()
    );

// TODO: Right now inserted data before test is == to expected result. This must be implemented differently.
const test_static_scenario_1: StaticTestConfig = {
    testName: "lets test if this config works",
    testData: test_static_budget_1,
    testSteps: [
        {
            requestType: "GET",
            route: "/budget",
            date: Period.period_0(),
            expectedResultInText: "should return A1",
            expectedResult: test_static_budget_1_period_0,
        },
        {
            requestType: "GET",
            route: "/budget",
            date: Period.period_1(),
            expectedResultInText: "should return A3x",
            expectedResult: test_static_budget_1_period_1,
        },
    ],
};

//runStaticTestScenario(test_static_scenario_1);

/**
 *
 * TEST SETUP
 *
 *
 * STATIC TESTS
 * - entire budget constructed.
 * - test on different filterdates.
 * - verify flat budget (latest versions)
 *
 * test data:
 * - budget w. category tree (3x)
 * - request per period: (request type, route, date, expected results) (6x)
 *
 * {testname: string, testdata: <budget w. categories>, teststeps: [{
 *  requestType: 'GET',
 *  route: '/budget',
 *  date: <period>,
 *  expectedResultsInText: string,
 *  expectedResults: <budget w. categories>
 *  }, {...}
 * ]}
 *
 *
 *
 *
 *
 * DYNAMIC TESTS
 * - budget exists without any category nodes
 * - http request construct category tree step by step
 * - test after each http request
 * - verify flat budget (latest versions) when testing end-points. Could also test entire structure with VersionBudget class by call the service
 *
 *
 * test data:
 * - base budget (1x)
 * - each request (request type, route, data, expected result(?)) (4x + 4x + 6x = 14x)
 *
 */
