import { request } from 'http';

const APPVEYOR_API_URL = process.env.APPVEYOR_API_URL

const isError = (r: jest.AssertionResult) => (r.failureMessages && r.failureMessages.length > 0)

const errorDetails = (msg:string) => {
    const  [message, ...stack] = msg.split("\n")
    return [message, stack.join("\n")]
}

const toAppveyorTest = (fileName: string) => (testResult: jest.AssertionResult) => {

    const [errorMessage, errorStack] =
        isError(testResult) ? 
            errorDetails(testResult.failureMessages[0]) :
            [undefined, undefined];

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
        const url = APPVEYOR_API_URL + "api/tests/batch";
        const json = JSON.stringify(results);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length
            }
        };
        const req = request(url, options)
        req.on("error", (error) => console.error("Unable to post test result", { error }));
        req.write(json);
        req.end();
    }

}


export default AppveyorReporter;