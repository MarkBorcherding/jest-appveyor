"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var APPVEYOR_API_URL = process.env.APPVEYOR_API_URL;
var ADD_TESTS_IN_BATCH = "api/tests/batch";
var isError = function (r) { return (r.failureMessages && r.failureMessages.length > 0); };
var errorDetails = function (testResult) {
    if (!isError(testResult)) {
        return;
    }
    var _a = testResult.failureMessages[0].split("\n"), message = _a[0], stack = _a.slice(1);
    return [message, stack.join("\n")];
};
var toAppveyorTest = function (fileName) { return function (testResult) {
    var _a = errorDetails(testResult) || [undefined, undefined], errorMessage = _a[0], errorStack = _a[1];
    return {
        testName: testResult.fullName,
        testFramework: 'Jest',
        fileName: fileName,
        outcome: testResult.status,
        durationMilliseconds: testResult.duration,
        ErrorMessage: errorMessage,
        ErrorStackTrace: errorStack,
        StdOut: "",
        StdErr: ""
    };
}; };
var AppveyorReporter = /** @class */ (function () {
    function AppveyorReporter() {
    }
    AppveyorReporter.prototype.onTestResult = function (test, testResult) {
        if (!APPVEYOR_API_URL) {
            return;
        }
        var results = testResult.testResults.map(toAppveyorTest(test.path));
        var json = JSON.stringify(results);
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length
            }
        };
        var req = http_1.request(APPVEYOR_API_URL + ADD_TESTS_IN_BATCH, options);
        req.on("error", function (error) { return console.error("Unable to post test result", { error: error }); });
        req.write(json);
        req.end();
    };
    return AppveyorReporter;
}());
exports.default = AppveyorReporter;
