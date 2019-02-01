/// <reference types="jest" />
declare class AppveyorReporter implements jest.Reporter {
    onTestResult(test: jest.Test, testResult: jest.TestResult): void;
}
export default AppveyorReporter;
