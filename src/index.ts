import { request } from 'http';

const APPVEYOR_API_URL = process.env.APPVEYOR_API_URL
const ADD_TESTS_IN_BATCH = "api/tests/batch";

const isError = (r: jest.AssertionResult) => (r.failureMessages && r.failureMessages.length > 0)

const errorDetails = (testResult: jest.AssertionResult) => {
    if(!isError(testResult)) { return; }
    const  [message, ...stack] = testResult.failureMessages[0].split("\n"); 
    return [message, stack.join("\n")]
}

const toAppveyorTest = (fileName: string) => (testResult: jest.AssertionResult) => {
    const [errorMessage, errorStack] = errorDetails(testResult) || [undefined, undefined];
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
}

class AppveyorReporter implements jest.Reporter {

    onTestResult(test: jest.Test, testResult: jest.TestResult) {
        if(!APPVEYOR_API_URL) { return }

        const results = testResult.testResults.map(toAppveyorTest(test.path));
        const json = JSON.stringify(results);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length
            }
        };
        const req = request(APPVEYOR_API_URL + ADD_TESTS_IN_BATCH, options)
        req.on("error", (error) => console.error("Unable to post test result", { error }));
        req.write(json);
        req.end();
    }

}


export default AppveyorReporter;