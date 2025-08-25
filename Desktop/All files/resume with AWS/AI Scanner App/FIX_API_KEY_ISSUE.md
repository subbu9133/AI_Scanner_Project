# 🔧 Fix API Key Issue - Step by Step

## 🚨 **Current Problem**
Your API key `AIzaSyBCJBiLlYLVaKc80o7loPri3-w-3enbkzk` from project "My Project (my-project-1745262518066)" is still showing as invalid.

## ✅ **Solution Steps**

### **Step 1: Enable the Generative AI API**
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Make sure you're in the correct project: "My Project (my-project-1745262518066)"
3. Click **"ENABLE"** if not already enabled
4. Wait for it to fully enable (may take a few minutes)

### **Step 2: Set Up Billing (Required)**
1. Go to: https://console.cloud.google.com/billing
2. Make sure your project has billing enabled
3. The Gemini API requires billing even for free tier usage

### **Step 3: Check API Key Restrictions**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key: `AIzaSyBCJBiLlYLVaKc80o7loPri3-w-3enbkzk`
3. Click on it to edit
4. Under "API restrictions":
   - **Option A**: Select "Don't restrict key" (for testing)
   - **Option B**: Select "Restrict key" and add "Generative Language API"

### **Step 4: Test API Key Directly**
1. Go to: https://aistudio.google.com/app/prompts/new
2. Try creating a simple prompt
3. If it works here, the key is valid

### **Step 5: Create New API Key (If Above Doesn't Work)**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"API key"**
4. Copy the new key
5. Update your configuration

## 🔄 **Alternative: Use AI Studio Directly**

**Easier Option:**
1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Choose **"Create API key in new project"**
4. This automatically sets up everything needed
5. Copy the new API key

## 📝 **Update Configuration**

Once you have a working API key:

```properties
# In application.properties
gemini.api.key=YOUR_NEW_WORKING_API_KEY
gemini.model.name=gemini-pro
```

## 🧪 **Test Steps**

1. **Enable API & Billing** in your Google Cloud project
2. **Update API key** in configuration
3. **Restart backend**
4. **Test**: `curl http://localhost:8054/api/scanner/test-gemini`
5. **Should see**: Actual AI response, not error

## 🆘 **If Still Not Working**

Try this temporary workaround:
```properties
gemini.api.key=disabled
```

This will use intelligent fallback responses while you sort out the API key issue.

---

**The most common issue is missing billing setup!** 💳
