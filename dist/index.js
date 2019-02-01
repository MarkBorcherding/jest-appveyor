"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var APPVEYOR_API_URL = process.env.APPVEYOR_API_URL;
var isError = function (r) { return (r.failureMessages && r.failureMessages.length > 0); };
var errorDetails = function (msg) {
    var _a = msg.split("\n"), message = _a[0], stack = _a.slice(1);
    return [message, stack.join("\n")];
};
var toAppveyorTest = function (fileName) { return function (testResult) {
    var _a = isError(testResult) ?
        errorDetails(testResult.failureMessages[0]) :
        [undefined, undefined], errorMessage = _a[0], errorStack = _a[1];
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
        var url = process.env.APPVEYOR_API_URL + "api/tests/batch";
        var json = JSON.stringify(results);
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length
            }
        };
        var req = http_1.request(url, options);
        req.on("error", function (error) { return console.error("Unable to post test result", { error: error }); });
        req.write(json);
        req.end();
    };
    return AppveyorReporter;
}());
exports.default = AppveyorReporter;
