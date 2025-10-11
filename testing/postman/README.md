# TCSS-460 Message API - Postman Testing Collection

Comprehensive Postman collection for testing the TCSS-460 Educational Message API, generated directly from the OpenAPI/Swagger specification. This collection provides complete test coverage for all API endpoints including health checks, public routes, protected routes (API key authentication), and documentation endpoints.

## 📋 Collection Overview

### **TCSS-460-Message-API-Complete.postman_collection.json**

**Generated from:** `docs/swagger.yaml`
**Base URL:** `http://localhost:8000`
**Total Requests:** 36 organized in 5 folders
**Test Scripts:** 36 automated tests validating responses and business logic

### **Test Categories:**

#### 1. Health Check (1 request)
- ✅ Server availability monitoring
- ✅ Response structure validation
- ✅ Timestamp verification

#### 2. Authentication (4 requests)
- ✅ GET API key generation form (HTML)
- ✅ POST generate API key (auto-saves to collection variable)
- ✅ Validation errors: missing name (400), invalid email (400)
- ✅ UUID v4 format validation

#### 3. Public Messages - No Auth Required (14 requests)
- ✅ POST create messages (priorities 1, 2, 3)
- ✅ POST validation errors (duplicate name, invalid priority)
- ✅ GET messages by priority (1, 2, 3)
- ✅ GET all messages (with totalCount & priorityBreakdown)
- ✅ GET message by name (success & 404)
- ✅ PATCH update message (success & 404)
- ✅ DELETE by name, DELETE by priority

#### 4. Protected Messages - API Key Required (9 requests)
- ✅ POST create with API key (success, missing key 401, invalid key 401)
- ✅ GET by priority (requires X-API-Key header)
- ✅ GET all protected messages
- ✅ GET by name
- ✅ PATCH update
- ✅ DELETE by name, DELETE by priority
- ✅ All use `{{apiKey}}` variable from Authentication folder

#### 5. Documentation (2 requests)
- ✅ GET documentation index (HTML)
- ✅ GET specific documentation file (example)

## 🚀 Quick Start

### Prerequisites
1. **API Server Running**: `npm run local` (server on http://localhost:8000)
2. **Database Available**: PostgreSQL container running (`docker compose up -d`)
3. **Postman Installed**: Desktop app or web version

### Setup Instructions

1. **Import Collection**:
   ```
   File → Import → Choose Files → Select TCSS-460-Message-API-Complete.postman_collection.json
   ```

2. **Collection Variables** (Auto-configured):
   - `baseUrl`: http://localhost:8000
   - `apiKey`: Auto-populated when you generate an API key
   - `testName1`, `testName2`, `testName3`: Auto-saved during test execution
   - `uniqueName1`, `uniqueName2`, `uniqueName3`: Auto-generated with timestamps
   - `protectedName1`, `protectedUniqueName1`: For protected endpoint testing

3. **Start Testing**:
   - **Recommended Order**: Run requests sequentially in folder order
   - **First Step**: Generate API key in folder 2 (saves to `{{apiKey}}` variable)
   - **Automated Tests**: Each request includes test scripts that auto-validate responses

## 🧪 Test Scenarios & Workflow

### **Recommended Testing Workflow**

1. **Health Check**
   ```
   GET /health
   → Verifies server is running
   → Tests: Status 200, response structure
   ```

2. **Authentication Setup**
   ```
   POST /api-key
   → Generates API key (saved automatically to {{apiKey}})
   → Tests: 201 status, UUID v4 format, response structure
   → Try error cases: missing name, invalid email
   ```

3. **Public Message CRUD**
   ```
   POST /message (priority 1, 2, 3)
   → Creates test messages
   → Tests: 201 status, formatted message string, messageId

   GET /message?priority=1
   → Retrieves by priority
   → Tests: 200 status, correct priority filtering

   GET /message/all
   → Gets all with breakdown
   → Tests: totalCount, priorityBreakdown object

   PATCH /message
   → Updates message content
   → Tests: 200 status, message updated

   DELETE /message/:name
   → Deletes specific message
   → Tests: 200 status, deletedName returned
   ```

4. **Protected Endpoints (API Key Required)**
   ```
   POST /protected/message (with X-API-Key header)
   → Same functionality as public, but authenticated
   → Tests: 201 with valid key, 401 without key

   GET /protected/message/all
   → Requires {{apiKey}} from step 2
   → Tests: 200 with key, 401 without
   ```

5. **Documentation Exploration**
   ```
   GET /doc
   → HTML documentation index

   GET /doc/http-fundamentals.md
   → Rendered markdown docs
   ```

### **Error Case Coverage**

| Error Type | Endpoint | Expected Status | Error Code |
|------------|----------|-----------------|------------|
| Missing API key | POST /protected/message | 401 | AUTH_KEY_REQUIRED |
| Invalid API key | POST /protected/message | 401 | AUTH_KEY_INVALID |
| Duplicate name | POST /message | 400 | MSG_NAME_EXISTS |
| Invalid priority | POST /message | 400 | MSG_INVALID_PRIORITY |
| Message not found | GET /message/:name | 404 | - |
| Invalid email | POST /api-key | 400 | - |

## 🔧 Collection Features

### **Automated Test Scripts**

Every request includes comprehensive test scripts:

```javascript
// Example: POST Generate API Key
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response contains API key", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('api_key');

    // Auto-save to collection variable
    pm.collectionVariables.set('apiKey', jsonData.data.api_key);
});

pm.test("API key is valid UUID v4 format", function () {
    var jsonData = pm.response.json();
    var uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    pm.expect(jsonData.data.api_key).to.match(uuidV4Pattern);
});
```

### **Dynamic Data Generation**

Uses Postman dynamic variables and pre-request scripts:

```javascript
// Pre-request script example
pm.collectionVariables.set('uniqueName1', 'HighPriority_' + Date.now());

// Body uses Postman variables
{
  "name": "{{$randomFullName}}",
  "email": "{{$randomEmail}}"
}
```

### **API Key Flow Management**

1. Generate key in Authentication folder → Auto-saved to `{{apiKey}}`
2. Protected endpoints automatically use `{{apiKey}}` in X-API-Key header
3. No manual copying required

## 📊 Running Collection Tests

### **Manual Execution**
1. Open collection in Postman
2. Expand folders and run requests individually
3. View test results in response tabs

### **Collection Runner**
1. Click "..." next to collection name
2. Select "Run collection"
3. Configure:
   - **Iterations**: 1 (recommended for first run)
   - **Delay**: 100-500ms between requests
   - **Save responses**: Enable for debugging
4. Click "Run TCSS-460 Message API Complete"
5. View pass/fail summary

### **Expected Results (Clean Database)**
- ✅ **36/36 tests passing**
- ⚠️ If re-running: May get duplicate name errors (expected)
- 💡 **Solution**: Delete existing messages or use unique names

### **Newman CLI Integration**

Run tests from command line:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run testing/postman/TCSS-460-Message-API-Complete.postman_collection.json \
  --reporters cli,json,html

# With delay between requests
newman run testing/postman/TCSS-460-Message-API-Complete.postman_collection.json \
  --delay-request 200
```

### **CI/CD Integration Example**

```yaml
# GitHub Actions example
- name: Run Postman Tests
  run: |
    npm install -g newman
    docker compose up -d
    npm run local &
    sleep 5
    newman run testing/postman/TCSS-460-Message-API-Complete.postman_collection.json \
      --reporters cli,junit \
      --reporter-junit-export results.xml
```

## 🔧 Troubleshooting

### **Common Issues**

**🔴 Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**:
```bash
# Start database
docker compose up -d

# Start server
npm run local
```

**🔴 Port Mismatch (404 on /health)**
```
GET http://localhost:8000/health → 404
```
**Solution**: Collection uses port 8000 (matches current server configuration)

**🔴 API Key Not Saved**
```
401 on protected endpoints after generating key
```
**Solution**:
- Ensure you ran "POST Generate API Key" first
- Check collection variables (click collection → Variables tab)
- Verify `apiKey` variable is populated

**🔴 Duplicate Name Errors on Re-run**
```
MSG_NAME_EXISTS error
```
**Solution**:
- Run DELETE requests to clean up
- Collection generates unique names with timestamps
- Manually clear database: `docker compose down -v && docker compose up -d`

**🔴 Protected Endpoint 401 Errors**
```
All protected endpoints returning 401
```
**Solution**:
- Generate fresh API key in folder 2
- Check X-API-Key header is using `{{apiKey}}` variable
- Verify key was saved: Console should show "API Key saved to collection variable"

### **Debug Mode**
1. Open Postman Console: `View → Show Postman Console` (or Alt+Ctrl+C)
2. Run request
3. Check console logs for:
   - Request headers (verify X-API-Key is populated)
   - Response body
   - Test script output (console.log statements)
   - Variable assignments

## 📚 Educational Features

### **Learning Objectives**

This collection demonstrates:

1. **RESTful API Testing Patterns**
   - CRUD operations (Create, Read, Update, Delete)
   - Query parameter filtering
   - Path parameter usage
   - HTTP method semantics (GET, POST, PATCH, DELETE)

2. **Authentication Testing**
   - Stateful API key authentication
   - 401 Unauthorized handling
   - Header-based authentication (X-API-Key)
   - Public vs. protected endpoint comparison

3. **Validation Testing**
   - Required field validation
   - Email format validation
   - Enum validation (priority 1-3)
   - Unique constraint testing (duplicate names)
   - Error response structure verification

4. **Test Automation Best Practices**
   - Comprehensive assertions
   - Dynamic data generation
   - Variable management
   - Test sequencing and dependencies
   - Pre-request scripting

5. **Response Structure Validation**
   - Success response format (success, data, message, timestamp)
   - Error response format (success, message, errorCode)
   - Nested object validation (priorityBreakdown)
   - Array response handling

### **Swagger.yaml Alignment**

Every request in this collection:
- ✅ Matches endpoint definitions from `docs/swagger.yaml`
- ✅ Uses documented request body schemas
- ✅ Validates documented response formats
- ✅ Tests documented error scenarios
- ✅ Includes examples from OpenAPI spec

### **Code Examples in Tests**

Each request includes educational comments:

```javascript
// Example: Understanding response structure
pm.test("Response follows SuccessResponse schema", function () {
    var jsonData = pm.response.json();

    // Required fields from swagger.yaml
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('timestamp');

    // Data structure varies by endpoint
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.have.property('entries');
    pm.expect(jsonData.data).to.have.property('totalCount');
    pm.expect(jsonData.data).to.have.property('priorityBreakdown');
});
```

## 🎯 Advanced Usage

### **Custom Test Scenarios**

1. **Bulk Message Creation**
   - Duplicate "POST Create Message" requests
   - Use Postman Collection Runner with data file
   - Import CSV with test data

2. **Priority Distribution Testing**
   - Create multiple messages across priorities
   - Run GET /message/all
   - Verify priorityBreakdown counts match

3. **API Key Lifecycle Testing**
   - Generate multiple keys
   - Test concurrent usage
   - Verify request tracking (check database)

4. **Performance Testing**
   - Monitor response times in test tab
   - Set assertions for max response time
   - Use Newman with `--reporter-cli-reporter-assertions` flag

### **Collection Organization**

Folders mirror API structure:
```
1. Health Check/          → System monitoring
2. Authentication/        → API key management
3. Public Messages/       → Open endpoints
4. Protected Messages/    → Authenticated endpoints
5. Documentation/         → Educational resources
```

## 📝 Collection Maintenance

### **Updating Collection**

When `swagger.yaml` changes:

1. **Add New Endpoints**
   - Create new request in appropriate folder
   - Add request body/params per swagger schema
   - Write test scripts matching response schema
   - Update this README

2. **Modify Existing Endpoints**
   - Update request body to match new schema
   - Adjust test assertions for new response format
   - Update variable references if needed

3. **Export & Commit**
   ```bash
   # In Postman: ... → Export → Collection v2.1
   # Save to: testing/postman/TCSS-460-Message-API-Complete.postman_collection.json
   git add testing/postman/
   git commit -m "chore: update Postman collection for [endpoint changes]"
   ```

### **Version History**

- **v2.0** (Current): Generated from swagger.yaml, includes API key auth, 36 requests
- **v1.0** (Deprecated): Manual collection, 25 requests, no auth testing

---

## 📖 Collection Specifications

| Specification | Value |
|--------------|-------|
| Collection Format | Postman Collection v2.1.0 |
| Total Requests | 36 |
| Total Folders | 5 |
| Variables | 10 collection variables |
| Test Scripts | 36 (one per request) |
| Pre-request Scripts | 6 (for dynamic data) |
| Authentication Types | API Key (X-API-Key header) |
| Base URL | http://localhost:8000 |
| Generated From | docs/swagger.yaml |
| Compatible With | Newman CLI, Postman Desktop, Postman Web |

---

**Happy Testing! 🚀**

*This collection is designed for educational purposes as part of the TCSS-460 Web APIs course. It demonstrates comprehensive API testing practices including authentication, validation, error handling, and automated test scripting.*
