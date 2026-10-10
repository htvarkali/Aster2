import XCTest
@testable import UWBBumpTest

/// Pure URL selection checks. No backend, network, or cloud credentials needed.
final class APIResolutionTests: XCTestCase {
    private let configuredDefault = "https://built-in.example.test"

    func testExplicitOverrideWinsOverConfiguredBuildDefault() {
        let client = BumpAPIClient.resolve(override: " \nhttp://127.0.0.1:8787\t ",
                                           buildDefault: configuredDefault)
        XCTAssertEqual(client?.baseURL.absoluteString, "http://127.0.0.1:8787")
    }

    func testInvalidOverrideFallsBackToValidBuildDefault() {
        for value in ["not a URL", "ftp://example.test", "https://", "$(UNRESOLVED)", "file:///tmp/server"] {
            let client = BumpAPIClient.resolve(override: value, buildDefault: configuredDefault)
            XCTAssertEqual(client?.baseURL.absoluteString, configuredDefault, value)
        }
    }

    func testClearingOverrideRestoresBuildDefault() {
        for value: String? in [nil, "", " \n\t "] {
            let client = BumpAPIClient.resolve(override: value, buildDefault: configuredDefault)
            XCTAssertEqual(client?.baseURL.absoluteString, configuredDefault)
        }
    }

    func testValidOverrideDoesNotNeedValidBuildDefault() {
        let client = BumpAPIClient.resolve(override: "https://demo.example.test",
                                           buildDefault: "$(BUMP_API_BASE_URL)")
        XCTAssertEqual(client?.baseURL.absoluteString, "https://demo.example.test")
    }

    func testNoUsableCandidateDisablesClient() {
        for value: String? in [nil, "", "$(BUMP_API_BASE_URL)", "not a URL", "https://"] {
            XCTAssertNil(BumpAPIClient.resolve(override: nil, buildDefault: value))
        }
        XCTAssertNil(BumpAPIClient.resolve(override: "ftp://example.test", buildDefault: nil))
    }

    func testValidBuildDefaultsKeepHTTPAndHTTPSPaths() {
        for value in ["http://demo.local:8787", "HTTPS://demo.example.test/api"] {
            let client = BumpAPIClient.resolve(override: nil, buildDefault: " \(value) ")
            XCTAssertEqual(client?.baseURL, URL(string: value))
        }
    }
}
