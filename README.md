# Jest Appveyor Reporter

[![Build status](https://ci.appveyor.com/api/projects/status/5m5wjnxqhf3yxxon?svg=true)](https://ci.appveyor.com/project/mark-borcherding/jest-appveyor)


Report tests to jest as they happen.

## Known Issues

    Jest did not exit one second after the test run has completed.
    This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.

