// a component test to verify that we get correct feedback from the budget route.
import chai from "chai";
import chaiHttp from "chai-http";
import { Budget } from "../../../models/1.4/budget.js";
import { Category } from "../../../models/1.4/category.js";
import { BudgetService } from "../../../services/budgetService.js";
import { CategoryService } from "../../../services/categoryService.js";
chai.use(chaiHttp);
describe("/budgets", () => {
    describe("GET", () => {
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
});
const BASEURL = "http://localhost:3000";
class Period {
}
Period.period_0 = () => {
    return new Date(2000, 0, 31);
};
Period.period_0_medio = () => {
    return new Date(2000, 0, 15);
};
Period.period_1 = () => {
    return new Date(2000, 1, 28);
};
Period.period_1_medio = () => {
    return new Date(2000, 1, 15);
};
Period.period_2 = () => {
    return new Date(2000, 2, 31);
};
Period.period_2_medio = () => {
    return new Date(2000, 2, 15);
};
Period.period_3 = () => {
    return new Date(2000, 3, 30);
};
Period.period_3_medio = () => {
    return new Date(2000, 3, 15);
};
Period.period_4 = () => {
    return new Date(2000, 4, 31);
};
Period.period_4_medio = () => {
    return new Date(2000, 4, 15);
};
Period.period_5 = () => {
    return new Date(2000, 5, 31);
};
Period.period_5_medio = () => {
    return new Date(2000, 5, 15);
};
const runStaticTest = (step, context) => {
    console.log("runStaticTest called...");
    it(`${step.requestType} ${step.route} with date ${step.date} returns ${step.expectedResultInText}`, () => {
        console.log("inside first describe block...");
        chai.request(BASEURL)
            .get(step.route)
            .end((err, res) => {
            let body = JSON.parse(res.text);
            console.log(body);
        });
    });
};
const runStaticTestScenario = (testConfig) => {
    // before: set up testConfig.testData
    let budgetId;
    before(() => {
        return BudgetService.createBudget(testConfig.testData.name, testConfig.testData.createDate, testConfig.testData.ownerName)
            .then((budget) => {
            var _a;
            budgetId = budget === null || budget === void 0 ? void 0 : budget.id;
            let newCatsPromises = (_a = testConfig.testData.categories) === null || _a === void 0 ? void 0 : _a.map((cat) => {
                return CategoryService.createCategory(cat.name, cat.amount, cat.endOfLife, cat.createDate, budgetId, cat.prevId, cat.nextId, cat.parentId).then(() => { });
            });
            return Promise.all(newCatsPromises);
        })
            .catch((err) => {
            throw err;
        });
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
const test_static_budget_1 = new Budget("test_static_budget_1", Period.period_0(), "tester", 1);
test_static_budget_1.categories = [
    new Category("A1", 1, false, Period.period_0_medio(), 1, 1, undefined, // prevId
    3, // nextId
    undefined, // parentId
    undefined // childrenIds
    ),
    new Category("A2", 2, false, Period.period_3_medio(), 2, 1, 4, // prevId
    5, // nextId
    undefined, // parentId
    undefined // childrenIds
    ),
    new Category("A3x", 1, true, Period.period_1(), 3, 1, 1, // prevId
    4, // nextId
    undefined, // parentId
    undefined // childrenIds
    ),
    new Category("A4 (A3)", 1, false, Period.period_2(), 4, 1, 3, // prevId
    2, // nextId
    undefined, // parentId
    undefined // childrenIds
    ),
    new Category("A5x", 0, true, Period.period_4_medio(), 5, 1, 2, // prevId
    undefined, // nextId
    undefined, // parentId
    undefined // childrenIds
    ),
];
const test_static_budget_1_period_0 = new Budget("test_static_budget_1", Period.period_0(), "tester", 1);
test_static_budget_1_period_0.categories =
    test_static_budget_1.categories.filter((cat) => cat.createDate <= Period.period_0());
const test_static_budget_1_period_1 = new Budget("test_static_budget_1", Period.period_1(), "tester", 1);
test_static_budget_1_period_1.categories =
    test_static_budget_1.categories.filter((cat) => cat.createDate <= Period.period_1());
// TODO: Right now inserted data before test is == to expected result. This must be implemented differently.
const test_static_scenario_1 = {
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
runStaticTestScenario(test_static_scenario_1);
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
