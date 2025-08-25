# 🔑 How to Get a Valid Gemini API Key

## 🚨 **Current Issue**
Your API key `5ed07087a223b82756b8096b5bf72d863bb430ca` is **INVALID**.

The error: `"API key not valid. Please pass a valid API key."`

## ✅ **Get a Valid Gemini API Key**

### **Step 1: Go to Google AI Studio**
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account

### **Step 2: Create API Key**
1. Click **"Create API Key"**
2. Select a Google Cloud project (or create new one)
3. Copy the generated API key (starts with `AIza...`)

### **Step 3: Update Your Configuration**

**Option A: Environment Variable (Recommended)**
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="AIzaSyYourActualAPIKeyHere"

# Windows Command Prompt
set GEMINI_API_KEY=AIzaSyYourActualAPIKeyHere
```

**Option B: Direct in application.properties**
```properties
gemini.api.key=AIzaSyYourActualAPIKeyHere
```

## 🔧 **Update Your Configuration**

### **Method 1: Environment Variable (Secure)**
1. **Set environment variable:**
   ```bash
   $env:GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
   ```

2. **Keep application.properties as:**
   ```properties
   gemini.api.key=${GEMINI_API_KEY:your_fallback_key}
   ```

### **Method 2: Direct Configuration**
Update `backend/src/main/resources/application.properties`:
```properties
gemini.api.key=AIzaSyYourActualAPIKeyHere
gemini.model.name=gemini-1.5-flash
```

## 🚀 **Test the API Key**

### **Step 1: Restart Backend**
```bash
cd backend
mvn spring-boot:run
```

### **Step 2: Test Gemini Connection**
```bash
curl http://localhost:8054/api/scanner/test-gemini
```

**Expected Response:**
```
Gemini AI test successful: [AI response]
```

### **Step 3: Test Universal Assistant**
1. Open any webpage
2. Click AI button → "🔍 Scan Page"
3. Should work without API key errors

## 📋 **Valid API Key Format**
- ✅ Starts with: `AIza`
- ✅ Length: ~39 characters
- ✅ Example: `AIzaSyDaGmWKa4JsXea5ZP2TwYf1n2aB3c4d5e6`
- ❌ Invalid: `5ed07087a223b82756b8096b5bf72d863bb430ca`

## 🔐 **Security Best Practices**

### **1. Never Commit API Keys**
Add to `.gitignore`:
```
*.env
application-local.properties
```

### **2. Use Environment Variables**
```properties
# application.properties
gemini.api.key=${GEMINI_API_KEY:}
```

### **3. Restrict API Key**
In Google Cloud Console:
- Restrict to specific APIs
- Set application restrictions
- Monitor usage

## 🆘 **Still Having Issues?**

### **Check API Key Validity:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

### **Common Issues:**
- **Quota Exceeded**: Check usage limits
- **Billing Required**: Enable billing in Google Cloud
- **API Not Enabled**: Enable Generative Language API
- **Wrong Project**: Check API key project

## 📱 **Quick Fix for Testing**

If you need to test immediately without a real API key, you can temporarily disable AI features by setting:

```properties
gemini.api.key=disabled
```

This will make the app use fallback responses only.

---

**Get your real API key from: https://aistudio.google.com/app/apikey** 🚀
