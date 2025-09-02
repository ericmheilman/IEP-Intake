# Manual Testing Instructions - University Startups IEP Processor

## Quick Manual Test

### Step 1: Access the Application
1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. Verify you see "University Startups IEP Processor" in the header

### Step 2: Test Upload Functionality
1. Click on the "Upload" tab in the navigation
2. You should see a file upload area with drag & drop functionality
3. Create a test PDF file or use any existing PDF
4. Either:
   - Drag and drop the PDF file onto the upload area, OR
   - Click the upload area to open file picker and select a PDF

### Step 3: Verify Upload Success
1. The upload should show a progress indicator
2. After upload completes, you should see a success message
3. The file should appear in the dashboard (if you navigate back)

### Step 4: Test Document Processing
1. After successful upload, look for a "Process Document" button
2. Click the button to start the AI processing pipeline
3. You should see processing steps with progress indicators
4. The system will simulate:
   - IEP data extraction
   - PII redaction and QA
   - Compliance scoring
   - Feedback generation

### Expected Results
- ✅ Upload should complete without errors
- ✅ No JavaScript errors in browser console
- ✅ Processing should show mock results
- ✅ Dashboard should update with document statistics

## Browser Console Check
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Expected: Only a 404 for favicon.ico (non-critical)

## Troubleshooting
If upload fails:
1. Check browser console for errors
2. Ensure the PDF file is under 10MB
3. Verify the file is a valid PDF format
4. Check that the development server is still running

## Test Data
The application uses mock data for demonstration:
- Mock student: "John Doe"
- Mock compliance score: 85%
- Mock feedback and recommendations

---
*Manual testing guide for University Startups IEP Processor*
