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

// a component test to verify that we get correct feedback from the budget route.
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { Period } from "../Utils/period.js";

chai.use(chaiHttp);
const BASEURL = "http://localhost:3000";
const ROUTE = "budget";
const TESTBUDGET_A_ID = 1;
const TESTBUDGET_B_ID = 2;
const TESTBUDGET_C_ID = 3;

// STATIC TESTS
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
        it("Should return budget with 0 root elements", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_A_ID);
            // manipulate
            let root = response.body.root;

            // verify
            expect(root).to.be.an("array").and.have.lengthOf(0);
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
        it("Should return budget with 0 root elements", async () => {
            // get
            let response = await chai
                .request(BASEURL)
                .get("/budget/" + TESTBUDGET_B_ID);

            // manipulate
            let root = response.body.root;

            // verify
            expect(root).to.be.an("array").and.have.lengthOf(0);
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
            const ROOTELEMENTCHILDRENNAMES = [];
            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTLENGTH = 0;
            const ROOTELEMENTNAME = undefined;
            const ROOTELEMENTAMOUNT = undefined;
            const ROOTELEMENTENDOFLIFE = undefined;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTNAME = "A4 (A3)";
            const ROOTELEMENTAMOUNT = 4;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTLENGTH = 0;
            const ROOTELEMENTNAME = undefined;
            const ROOTELEMENTAMOUNT = undefined;
            const ROOTELEMENTENDOFLIFE = undefined;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
        });
    });
    describe("testbudget_b", () => {
        const BUDGETNAME = "testbudget_b";
        const BUDGETID = TESTBUDGET_B_ID;
        const STATUSCODE = 200;
        const CONTENTTYPE = "application/json";

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
            const ROOTELEMENTCHILDRENNAMES = [];
            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTNAME = "A4";
            const ROOTELEMENTAMOUNT = 4;
            const ROOTELEMENTENDOFLIFE = false;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTLENGTH = 0;
            const ROOTELEMENTNAME = undefined;
            const ROOTELEMENTAMOUNT = undefined;
            const ROOTELEMENTENDOFLIFE = undefined;
            const ROOTELEMENTPARENT = undefined;
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");
            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
        });
    });
    describe("testbudget_c", () => {
        const BUDGETNAME = "testbudget_c";
        const BUDGETID = TESTBUDGET_C_ID;
        const STATUSCODE = 200;
        const CONTENTTYPE = "application/json";

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
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = [];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = ["B1"];
            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = ["B1", "C1"];

            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
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
            const ROOTELEMENTCHILDRENNAMES = ["B1", "C1", "D1"];
            const QUERYSTRING =
                "/" +
                [
                    ROUTE,
                    String(BUDGETID),
                    String(PERIOD.getFullYear()),
                    String(PERIOD.getMonth() + 1).padStart(2, "0"),
                ].join("/");

            it(`Should return status ${STATUSCODE} of type "${typeof STATUSCODE}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate

                // verify
                expect(response.status).to.eql(STATUSCODE);
                expect(response.status).to.be.a(typeof STATUSCODE);
            });
            it(`Should return content-type: ${CONTENTTYPE} of type "${typeof CONTENTTYPE}"`, async () => {
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
                expect(contentType).to.be.a(typeof CONTENTTYPE);
            });
            it(`should return budget named ${BUDGETNAME} of type "${typeof BUDGETNAME}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.name).to.equal(BUDGETNAME);
                expect(budget.name).to.be.a(typeof BUDGETNAME);
            });
            it(`should return budget with id ${BUDGETID} of type "${typeof BUDGETID}"`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.id).to.equal(BUDGETID);
                expect(budget.id).to.be.a(typeof BUDGETID);
            });
            it(`should return budget with ${ROOTELEMENTLENGTH} root element(s)`, async () => {
                // get
                let response = await chai.request(BASEURL).get(QUERYSTRING);
                // manipulate
                let budget = response.body;

                // verify
                expect(budget.root).to.have.lengthOf(ROOTELEMENTLENGTH);
            });
            if (ROOTELEMENTLENGTH > 0) {
                it(`should return budget with root element named ${ROOTELEMENTNAME} of type "${typeof ROOTELEMENTNAME}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.name).to.equal(ROOTELEMENTNAME);
                    expect(element.name).to.be.a(typeof ROOTELEMENTNAME);
                });
                it(`should return budget with root element that has amount = ${ROOTELEMENTAMOUNT} of type "${typeof ROOTELEMENTAMOUNT}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element.amount).to.equal(ROOTELEMENTAMOUNT);
                    expect(element.amount).to.be.a(typeof ROOTELEMENTAMOUNT);
                });
                it(`should return budget with root element with endOfLife = ${ROOTELEMENTENDOFLIFE} of type "${typeof ROOTELEMENTENDOFLIFE}"`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTENDOFLIFE
                        ? expect(element.endOfLife).to.be.true
                        : expect(element.endOfLife).to.be.false;
                    expect(element.endOfLife).to.be.an(
                        typeof ROOTELEMENTENDOFLIFE
                    );
                });
                it(`should return budget with root element that has ${
                    ROOTELEMENTPARENT ? "a" : "no"
                } parent`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    ROOTELEMENTPARENT
                        ? expect(element).to.have.property("parent")
                        : expect(element).to.not.have.property("parent");

                    ROOTELEMENTPARENT
                        ? expect(element.parent.name).to.equal(
                              ROOTELEMENTPARENT
                          )
                        : false;
                });

                it(`should return budget with root element that has ${
                    ROOTELEMENTCHILDRENNAMES.length
                        ? "children named " +
                          ROOTELEMENTCHILDRENNAMES.join(", ")
                        : "no children"
                }`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0]; // works only for first element in root

                    // verify
                    element?.children?.length // THIS DOES NOT WORK WITH
                        ? expect(
                              element.children.map((child) => child.name)
                          ).to.have.members(ROOTELEMENTCHILDRENNAMES)
                        : expect(element).to.not.have.property("children");
                });
                it(`should return budget with root element that has no next or nextid element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("next");
                    expect(element).to.not.have.property("nextId");
                });
                it(`should return budget with root element that has no prev or prevId element`, async () => {
                    // get
                    let response = await chai.request(BASEURL).get(QUERYSTRING);
                    // manipulate
                    let budget = response.body;
                    let element = budget.root[0];

                    // verify
                    expect(element).to.not.have.property("prev");
                    expect(element).to.not.have.property("prevId");
                });
            }
        });
    });
});

// DYNAMIC TESTS - AWAITING BACK END IS MIGRATED FULLY TO 1.4
describe("POST /budget/:id - constructing budgets", () => {
    describe("testbudget_a", () => {
        describe("POST A1", () => {
            // after posting we test
            // - calling the api from period 5 - showing latest status of the budget and it's categories
            // - call to the backend verifying, that the underlying versionBudget is correct. I.e. that next/prev links are updated correctly, when a new node is inserted in the middle of the chain

            let PAYLOAD = {};

            let response;

            before("make POST request", async () => {
                // await chai.request(BASEURL).post(ROUTE).send(PAYLOAD);
            });

            beforeEach("GET budget", async () => {
                response = await chai.request(BASEURL).get("/budget/3/2000/01");
            });
            describe("API", () => {
                it("API returns budget with only 1 root element", () => {
                    expect(response.body.root)
                        .to.be.an("array")
                        .and.have.lengthOf(1);
                });
                it('API returns budget with root element named "A1"', () => {
                    expect(response.body.root[0].name).to.equal("A1");
                });
                it("API returns budget with root element, that has amount = 1");
                it(
                    "API returns budget with root element, that has no children"
                );
            });
            describe("VersionBudget and VersionCategory", () => {
                it("VersionBudget has 1 category");
                it("VersionBudget has category named A1");
            });
        });
        describe("POST A2", () => {
            it("API returns budget with only 1 root element");
            it('API returns budget with root element named "A2"');
            it("API returns budget with root element, that has amount = 2");
            it("API returns budget with root element, that has no children");
            it("VersionBudget has 2 categories");
            it("VersionBudget has category named A1");
            it("VersionBudget has category named A2");
            it("VersionCategory A1 has next VersionCategory named A2");
            it("VersionCategory A2 has prev VersionCategory named A1");
            it("VersionCategory A1 has no parent");
            it("VersionCategory A1 has no children");
            it("VersionCategory A2 has no parent");
            it("VersionCategory A2 has no children");
        });
        describe("POST A3x", () => {
            it("API returns budget with only 1 root element");
            it('API returns budget with root element named "A2"');
            it("API returns budget with root element, that has amount = 2");
            it("API returns budget with root element, that has no children");

            it("VersionBudget has 3 categories");

            it("VersionBudget has category named A1");
            it("VersionBudget has category named A2");
            it("VersionBudget has category named A3x");

            it("VersionCategory A1 has next VersionCategory named A3x");
            it("VersionCategory A2 has no next");
            it("VersionCategory A3x has next VersionCategory named A2");

            it("VersionCategory A1 has no prev");
            it("VersionCategory A2 has prev VersionCategory named A3x");
            it("VersionCategory A3x has prev VersionCategory named A1");

            it("VersionCategory A1 has no parent");
            it("VersionCategory A1 has no children");
            it("VersionCategory A2 has no parent");
            it("VersionCategory A2 has no children");
            it("VersionCategory A3x has no parent");
            it("VersionCategory A3x has no children");
        });
        describe("POST A4 (A3)", () => {
            it("API returns budget with only 1 root element");
            it('API returns budget with root element named "A2"');
            it("API returns budget with root element, that has amount = 2");
            it("API returns budget with root element, that has no children");

            it("VersionBudget has 4 categories");

            it("VersionBudget has category named A1");
            it("VersionBudget has category named A2");
            it("VersionBudget has category named A3x");
            it("VersionBudget has category named A4");

            it("VersionCategory A1 has next VersionCategory named A3x");
            it("VersionCategory A2 has no next");
            it("VersionCategory A3x has next VersionCategory named A4");
            it("VersionCategory A4 has next VersionCategory named A2");

            it("VersionCategory A1 has no prev");
            it("VersionCategory A2 has prev VersionCategory named A4");
            it("VersionCategory A3x has prev VersionCategory named A1");
            it("VersionCategory A4 has prev VersionCategory named A3x");

            it("VersionCategory A1 has no parent");
            it("VersionCategory A1 has no children");
            it("VersionCategory A2 has no parent");
            it("VersionCategory A2 has no children");
            it("VersionCategory A3x has no parent");
            it("VersionCategory A3x has no children");
            it("VersionCategory A4 has no parent");
            it("VersionCategory A4 has no children");
        });
        describe("POST A5x", () => {
            it("API returns budget with only 0 root elements");

            it("VersionBudget has 5 categories");

            it("VersionBudget has category named A1");
            it("VersionBudget has category named A2");
            it("VersionBudget has category named A3x");
            it("VersionBudget has category named A4");
            it("VersionBudget has category named A5x");

            it("VersionCategory A1 has next VersionCategory named A3x");
            it("VersionCategory A2 has next VersionCategory named A5x");
            it("VersionCategory A3x has next VersionCategory named A4");
            it("VersionCategory A4 has next VersionCategory named A2");
            it("VersionCategory A5x has no next");

            it("VersionCategory A1 has no prev");
            it("VersionCategory A2 has prev VersionCategory named A4");
            it("VersionCategory A3x has prev VersionCategory named A1");
            it("VersionCategory A4 has prev VersionCategory named A3x");
            it("VersionCategory A5x has prev VersionCategory named A2");

            it("VersionCategory A1 has no parent");
            it("VersionCategory A1 has no children");
            it("VersionCategory A2 has no parent");
            it("VersionCategory A2 has no children");
            it("VersionCategory A3x has no parent");
            it("VersionCategory A3x has no children");
            it("VersionCategory A4 has no parent");
            it("VersionCategory A4 has no children");
            it("VersionCategory A5x has no parent");
            it("VersionCategory A5x has no children");
        });
    });
});
