# Universal AI Assistant - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue: "Sorry, I couldn't scan this page"

This error indicates the Universal AI Assistant can't connect to your backend. Here's how to fix it:

## ✅ **Step 1: Check Backend Status**

### Start Your Backend:
```bash
cd "AI Scanner App/backend"
mvn spring-boot:run
```

### Verify It's Running:
- Open: http://localhost:8054/api/scanner/health
- Should see: "AI Scanner Pro Backend is running with Gemini AI!"

## ✅ **Step 2: Test API Connection**

1. **Open Test Page**: http://localhost:3000/test-api.html
2. **Click "Test Health Endpoint"**
3. **Check Results**:
   - ✅ Green = Working
   - ❌ Red = Problem found

## ✅ **Step 3: Common Fixes**

### Fix 1: Backend Not Running
```bash
# In backend directory
mvn clean install
mvn spring-boot:run
```

### Fix 2: Port Already in Use
```bash
# Kill process on port 8054
netstat -ano | findstr :8054
taskkill /PID <process_id> /F

# Or change port in application.properties
server.port=8055
```

### Fix 3: CORS Issues
Already fixed in the code with proper CORS configuration.

### Fix 4: Gemini API Key
Make sure your Gemini API key is set in `application.properties`:
```properties
gemini.api.key=your_actual_api_key_here
```

## 🔧 **Step 4: Debug Mode**

### Enable Console Logging:
1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Try scanning a page**
4. **Check for error messages**

Common Console Errors:
- `Failed to fetch` = Backend not running
- `CORS error` = Already fixed, restart backend
- `404 Not Found` = Wrong API endpoint
- `500 Internal Server Error` = Backend error, check logs

## 🌐 **Step 5: Test on Different Pages**

### Test Sequence:
1. **Local Test Page**: http://localhost:3000/test-page.html
2. **API Test Page**: http://localhost:3000/test-api.html
3. **External Website**: Any form website

### Expected Behavior:
- ✅ AI button appears on every page
- ✅ Chat opens when clicked
- ✅ "Scan Page" analyzes the current page
- ✅ Questions get intelligent responses

## 🔍 **Step 6: Detailed Diagnostics**

### Check Backend Logs:
```bash
# Look for errors in the console where backend is running
# Common issues:
# - Port binding errors
# - Gemini API errors
# - CORS preflight failures
```

### Check Network Tab (DevTools):
1. **Open DevTools → Network tab**
2. **Click "Scan Page"**
3. **Look for API calls to localhost:8054**
4. **Check status codes and responses**

## 📱 **Step 7: Browser Extension Issues**

### If Extension Not Working:
1. **Go to**: chrome://extensions/
2. **Check**: Universal AI Assistant is enabled
3. **Reload**: Click reload button on the extension
4. **Refresh**: Current webpage

### Extension Console Errors:
1. **Go to**: chrome://extensions/
2. **Click**: "Details" on Universal AI Assistant
3. **Click**: "Inspect views: service worker"
4. **Check**: Console for errors

## 🚀 **Step 8: Quick Fixes**

### Restart Everything:
```bash
# 1. Stop backend (Ctrl+C)
# 2. Restart backend
cd backend
mvn spring-boot:run

# 3. Reload browser extension
# 4. Refresh webpage
```

### Alternative Testing:
```bash
# Test with curl
curl -X GET http://localhost:8054/api/scanner/health

# Should return: "AI Scanner Pro Backend is running with Gemini AI!"
```

## 📞 **Still Having Issues?**

### Check These Files:
- `backend/src/main/resources/application.properties` - Configuration
- `backend/src/main/java/com/aiscanner/config/CorsConfig.java` - CORS setup
- `frontend/public/universal-assistant.js` - Client code

### Verify Settings:
- Backend runs on: `localhost:8054`
- Frontend serves from: `localhost:3000`
- API base URL: `http://localhost:8054/api/scanner`
- CORS allows: All origins (`*`)

Your Universal AI Assistant should work perfectly once the backend is running! 🎉
