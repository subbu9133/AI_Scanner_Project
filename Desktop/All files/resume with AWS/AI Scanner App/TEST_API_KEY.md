# 🔑 API Key Troubleshooting

## 🚨 **Current Status**
Your API key `AIzaSyBCJBiLlYLVaKc80o7loPri3-w-3enbkzk` is returning **400 Bad Request - API key not valid**.

## ✅ **Step-by-Step Fix**

### **1. Verify Your API Key**
Go to: https://aistudio.google.com/app/apikey
- Check if the key is exactly: `AIzaSyBCJBiLlYLVaKc80o7loPri3-w-3enbkzk`
- Make sure there are no extra spaces or characters
- Verify the key is enabled and has permissions

### **2. Test Your API Key Manually**

**Option A: Using Browser**
1. Go to: https://aistudio.google.com/app/prompts/new
2. Try typing a simple prompt
3. If it works, your key is valid

**Option B: Using Our Test Endpoint**
```bash
# After backend starts, test with:
curl http://localhost:8054/api/scanner/test-gemini
```

### **3. Common Issues & Solutions**

#### **Issue: Wrong Project**
- Make sure the API key is from the correct Google Cloud project
- Check if billing is enabled for the project

#### **Issue: API Not Enabled**
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Generative Language API"
3. Click "Enable"

#### **Issue: Quota/Billing**
- Check if you have quota remaining
- Verify billing is set up (if required)

#### **Issue: Key Restrictions**
- Check if the API key has application restrictions
- Temporarily remove restrictions for testing

### **4. Alternative: Create New API Key**

If the current key doesn't work:
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Choose "Create API key in new project" 
4. Copy the new key
5. Update your configuration

### **5. Test Configuration**

**Current Config:**
```properties
gemini.api.key=AIzaSyBCJBiLlYLVaKc80o7loPri3-w-3enbkzk
gemini.model.name=gemini-1.5-flash
```

**Test Steps:**
1. Restart backend: `mvn spring-boot:run`
2. Test health: `curl http://localhost:8054/api/scanner/health`
3. Test Gemini: `curl http://localhost:8054/api/scanner/test-gemini`

### **6. Fallback Option**

If you can't get the API key working right now, you can still test the app functionality by setting:
```properties
gemini.api.key=disabled
```

This will use intelligent fallback responses while you sort out the API key issue.

## 📞 **Quick Checklist**

- [ ] API key is exactly correct (no typos)
- [ ] Generative Language API is enabled
- [ ] Billing is set up (if required)
- [ ] No application restrictions on the key
- [ ] Using a supported model (gemini-1.5-flash)

## 🔄 **Next Steps**

1. **Verify your API key** at https://aistudio.google.com/app/apikey
2. **Copy the exact key** (check for typos)
3. **Update configuration** 
4. **Restart backend**
5. **Test the app**

Your Universal AI Assistant will work perfectly once the API key is properly configured! 🚀
