# TCSS-460 Message API - Postman Testing Collection

Comprehensive Postman collection for testing the TCSS-460 Educational Message API. This collection provides complete test coverage for all API endpoints including validation, error handling, and business logic scenarios.

## 📋 Collection Overview

### **Test Categories:**
- ✅ **Health Check** - API availability monitoring
- ✅ **Message Creation** - POST operations with all priority levels
- ✅ **Validation Testing** - Error handling for invalid inputs
- ✅ **Message Retrieval** - GET operations and filtering
- ✅ **Individual Messages** - Name-based operations
- ✅ **Message Updates** - PUT operations and validation
- ✅ **Message Deletion** - DELETE operations and verification

### **Total Test Cases:** 25 requests covering all API functionality

## 🚀 Quick Start

### Prerequisites
1. **API Server Running**: Ensure the Message API is running on `http://localhost:8000`
2. **Database Available**: PostgreSQL database should be accessible
3. **Postman Installed**: Desktop app or web version

### Setup Instructions

1. **Import Collection**:
   ```
   File → Import → Choose Files → Select TCSS-460-Message-API.postman_collection.json
   ```

2. **Import Environment**:
   ```
   File → Import → Choose Files → Select Message-API-Environment.postman_environment.json
   ```

3. **Select Environment**:
   - Click environment dropdown (top right)
   - Select "Message API Environment"

4. **Start Testing**:
   - Use "Run Collection" for automated testing
   - Or run individual requests manually

## 🧪 Test Scenarios

### **1. Health Check**
- Verifies API availability
- Tests response structure
- Validates response time

### **2. Message Creation (Success Cases)**
- Create messages with priority 1 (High)
- Create messages with priority 2 (Medium)
- Create messages with priority 3 (Low)
- Validates response structure and data

### **3. Validation Error Testing**
- Missing required fields (name, message)
- Invalid priority values (0, 4+)
- Duplicate name handling
- Malformed JSON syntax

### **4. Message Retrieval**
- Get all messages
- Filter by priority (1, 2, 3)
- Invalid priority parameter testing
- Response structure validation

### **5. Individual Message Operations**
- Get message by name (existing/non-existent)
- Update message (success/not found/invalid data)
- Delete message (success/not found)
- Deletion verification

## 🌐 Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API server base URL | `http://localhost:8000` |
| `test_name_1` | Primary test username | `TestUser1` |
| `test_name_2` | Secondary test username | `TestUser2` |
| `test_message` | Default test message | `Hello from Postman!...` |
| `invalid_priority` | Invalid priority for testing | `5` |
| `timestamp` | Dynamic timestamp (auto-set) | *Generated* |

### Customizing Environment
- Click "Environment" dropdown → "Message API Environment"
- Modify variables as needed for your testing scenario
- Common customizations:
  - Change `base_url` for different environments
  - Update test usernames to avoid conflicts
  - Modify test messages for specific scenarios

## 📊 Test Automation

### **Running All Tests**
1. Click "Collections" in sidebar
2. Click "..." next to "TCSS-460 Message API"
3. Select "Run collection"
4. Configure run settings:
   - **Iterations**: 1 (recommended)
   - **Delay**: 100ms between requests
   - **Data**: None needed
5. Click "Run TCSS-460 Message API"

### **Test Results**
- ✅ **Green**: Test passed
- ❌ **Red**: Test failed
- 📊 **Summary**: Overall pass/fail statistics
- 📝 **Console**: Detailed logs and error messages

### **Expected Results**
With a fresh database:
- **Health Check**: ✅ Should pass
- **Message Creation**: ✅ Should pass (creates test data)
- **Validation Errors**: ✅ Should pass (expected failures)
- **Message Retrieval**: ✅ Should pass (finds created data)
- **Individual Operations**: ✅ Should pass
- **Cleanup**: Some tests delete created data

## 🔧 Troubleshooting

### Common Issues

**🔴 Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**: Start the API server with `npm run start:full`

**🔴 Database Connection Error**
```
Database connection failed
```
**Solution**: Ensure PostgreSQL is running and accessible

**🔴 404 Not Found on Health Check**
```
GET http://localhost:8000/health → 404
```
**Solution**: Check if API is running on correct port (should be 8000)

**🔴 Test Failures After Multiple Runs**
```
MSG_NAME_EXISTS errors
```
**Solution**:
- Clear database OR
- Change test usernames in environment variables OR
- Run deletion tests first

### **Debug Mode**
1. Open Postman Console (View → Show Postman Console)
2. Run individual requests to see detailed logs
3. Check response body for error details
4. Verify environment variables are set correctly

## 📚 Educational Features

### **Learning Objectives**
This collection demonstrates:
- **API Testing Best Practices**
- **Test Automation Patterns**
- **Error Handling Validation**
- **Environment Management**
- **Response Assertions**

### **Code Examples**
Each test includes:
- Pre-request scripts for setup
- Comprehensive assertions
- Educational comments
- Console logging for debugging

### **Test Organization**
- **Logical grouping** by functionality
- **Sequential execution** order
- **Dependency management** between tests
- **Clear naming** for easy understanding

## 🎯 Advanced Usage

### **Custom Test Scenarios**
1. **Load Testing**: Duplicate requests with different data
2. **Edge Cases**: Modify requests to test boundary conditions
3. **Integration Testing**: Chain requests for complex workflows
4. **Performance Testing**: Monitor response times

### **Newman CLI Integration**
Run tests from command line:
```bash
newman run TCSS-460-Message-API.postman_collection.json \
  -e Message-API-Environment.postman_environment.json \
  --reporters cli,json
```

### **CI/CD Integration**
Add to GitHub Actions or other CI systems for automated API testing.

## 📝 Collection Maintenance

### **Updating Tests**
- Modify requests to match API changes
- Update environment variables as needed
- Add new test scenarios for new endpoints
- Keep assertions current with response format changes

### **Version Control**
- Export updated collection/environment files
- Commit changes to repository
- Document breaking changes in commit messages

---

**Happy Testing! 🚀**

*This collection is designed for educational purposes as part of the TCSS-460 Web APIs course.*