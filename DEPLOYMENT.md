# 🚀 Deployment Guide

## Backend Deployment on Render

### ✅ **Status: Ready for Deployment**

Your backend has been fixed and is now ready for Render deployment. The changes include:

- **Python 3.8.16** specified in `runtime.txt` and `render.yaml`
- **Compatible package versions** that avoid compilation issues
- **Pre-compiled wheels** for pandas and other packages

### 🔧 **Render Deployment Steps**

1. **Go to [render.com](https://render.com)** and sign in
2. **Click "New +"** → **"Web Service"**
3. **Connect your Git repository**: `geoffe-dashboard-and-api`
4. **Configure the service**:

   - **Name**: `geoffe-dashboard-api` (or your preferred name)
   - **Environment**: `Python`
   - **Root Directory**: `Backend` ⚠️ **This is crucial!**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (or choose your preferred plan)

5. **Click "Create Web Service"**

### 🌐 **Backend URL After Deployment**

```
https://your-service-name.onrender.com/api/calculate-distances-and-merge-costs
```

---

## Frontend Deployment on Vercel

### ✅ **Status: Ready for Deployment**

Your React frontend is complete and ready for Vercel deployment.

### 🔧 **Vercel Deployment Steps**

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend folder**:

   ```bash
   cd frontend
   ```

3. **Deploy**:

   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Choose your team/account
   - Confirm deployment settings

### 🌐 **Frontend URL After Deployment**

```
https://your-project-name.vercel.app
```

---

## 🔗 **Connect Frontend to Backend**

### **Before Deployment**

Update the API URL in `frontend/src/config.ts`:

```typescript
export const API_CONFIG = {
  development: "http://localhost:8000",
  production: "https://your-actual-render-url.onrender.com", // ← Update this
  // ...
};
```

### **After Deployment**

1. **Deploy backend first** on Render
2. **Copy the backend URL** from Render
3. **Update frontend config** with the actual backend URL
4. **Deploy frontend** on Vercel

---

## 📋 **Deployment Checklist**

### **Backend (Render)**

- [ ] Git repository connected
- [ ] Root Directory set to `Backend`
- [ ] Python 3.8.16 specified
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn app:app`
- [ ] Service deployed successfully
- [ ] API endpoint accessible

### **Frontend (Vercel)**

- [ ] Vercel CLI installed
- [ ] Backend URL updated in config
- [ ] Frontend built successfully
- [ ] Deployed to Vercel
- [ ] Dashboard accessible

---

## 🧪 **Testing After Deployment**

### **Test Backend API**

```bash
curl -X POST https://your-backend-url.onrender.com/api/calculate-distances-and-merge-costs \
  -F "community_file=@test.csv" \
  -F "clinic_file=@test.csv" \
  -F "charlie_file=@test.csv" \
  -F "costs_file=@test.csv"
```

### **Test Frontend**

1. Open your Vercel URL
2. Upload test CSV files
3. Verify API integration works
4. Check results display

---

## 🆘 **Troubleshooting**

### **Backend Build Fails**

- Check Python version is 3.8.16
- Verify Root Directory is set to `Backend`
- Check package compatibility in requirements.txt

### **Frontend Build Fails**

- Ensure Node.js 16+ is installed
- Check all dependencies are installed
- Verify TypeScript compilation

### **API Connection Issues**

- Confirm backend URL is correct
- Check CORS settings
- Verify backend is running

---

## 📞 **Support**

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Check the GitHub repository

---

## 🎯 **Next Steps**

1. **Deploy Backend** on Render
2. **Update Frontend Config** with backend URL
3. **Deploy Frontend** on Vercel
4. **Test Complete System**
5. **Share Your Dashboard!** 🎉

Your healthcare facility analysis dashboard will be live and accessible to users worldwide! 🌍
