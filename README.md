# Form.io Integration Backend

A NestJS backend that integrates with Form.io to provide a complete form management system with assignment logic, prepopulation, and submission handling.

## Features

- **Form Management**: Create and version forms with field definitions
- **Form Assignments**: Assign forms to specific contexts, services, and centers with fallback logic
- **Form Submissions**: Save and retrieve form submissions with prepopulation support
- **Complete Form Flow**: Orchestrated form flow from assignment to submission

## API Endpoints

### Form Flow (Main Integration Points)

#### GET /api/form-flow/assignments
Get form assignments with fallback logic and prepopulation data.

**Query Parameters:**
- `context` (required): Form context (e.g., "service_form")
- `serviceId` (optional): Service ID for filtering
- `centerId` (optional): Center ID for filtering

**Response:**
```json
[
  {
    "formId": "FORM_CONSENT_LASER",
    "formUrl": "https://your-form-io-domain.com/forms/FORM_CONSENT_LASER",
    "prepopulateData": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "formDefinition": {
      "formId": "FORM_CONSENT_LASER",
      "version": 1,
      "name": "Laser Consent Form",
      "context": "service_form",
      "fields": [...]
    }
  }
]
```

#### GET /api/form-flow/form/:formId
Get a specific form with prepopulation data.

**Query Parameters:**
- `guestId` (optional): Guest ID for prepopulation
- `appointmentId` (optional): Appointment ID for prepopulation

#### GET /api/form-flow/complete/:formId
Get a complete form with schema, prepopulate data, and draft data.

**Query Parameters:**
- `guestId` (optional): Guest ID for prepopulation and draft retrieval
- `appointmentId` (optional): Appointment ID for prepopulation and draft retrieval

**Response**: Returns form schema (Form.io format), prepopulate data, and draft data

#### POST /api/form-flow/submit/:formId
Submit form data.

**Body:**
```json
{
  "submissionData": {
    "name": "John Doe",
    "email": "john@example.com",
    "consent": true
  },
  "centerId": "C_NY_01",
  "submittedBy": "mobile_app",
  "guestId": "GUEST_123",
  "appointmentId": "APPT_789"
}
```

### Individual Module Endpoints

#### Forms
- `POST /api/forms` - Create a new form
- `GET /api/forms` - Get all forms
- `GET /api/forms/context/:context` - Get forms by context
- `GET /api/forms/:formId` - Get specific form
- `GET /api/forms/:formId/url` - Get Form.io URL
- `POST /api/forms/:formId/version` - Create new version

#### Form Assignments
- `POST /api/form-assignments` - Create assignment
- `GET /api/form-assignments` - Get all assignments
- `GET /api/form-assignments/resolve` - Resolve assignments with fallback logic

#### Form Submissions
- `POST /api/form-submissions` - Create submission
- `GET /api/form-submissions` - Get all submissions
- `GET /api/form-submissions/form/:formId` - Get by form
- `GET /api/form-submissions/guest/:guestId` - Get by guest
- `GET /api/form-submissions/appointment/:appointmentId` - Get by appointment
- `GET /api/form-submissions/prepopulate/:formId` - Get prepopulation data
- `GET /api/form-submissions/history/:formId` - Get submission history
- `POST /api/form-submissions/draft` - Save draft
- `GET /api/form-submissions/draft/:formId` - Get draft
- `DELETE /api/form-submissions/draft/:formId` - Delete draft
- `GET /api/form-submissions/data/:formId` - Get prepopulate + draft data

## Form Flow Example

### 1. Mobile App Requests Form
**Request**: `GET /api/form-flow/complete/FORM_CONSENT_LASER?guestId=GUEST_123&appointmentId=APPT_789`

**Response**:
```json
{
  "formId": "FORM_CONSENT_LASER",
  "formUrl": "https://rarfqwtirrjetaj.form.io/skinscript",
  "name": "Laser Treatment Consent Form",
  "context": "service_form",
  "schema": {
    "components": [
      {
        "type": "textfield",
        "key": "patientName",
        "label": "Patient Name",
        "input": true,
        "validate": { "required": true }
      },
      {
        "type": "select",
        "key": "treatmentType",
        "label": "Treatment Type",
        "data": {
          "values": [
            { "label": "Laser Hair Removal", "value": "Laser Hair Removal" },
            { "label": "Laser Skin Treatment", "value": "Laser Skin Treatment" }
          ]
        }
      }
    ]
  },
  "prepopulateData": {
    "patientName": "John Doe",
    "email": "john@example.com"
  },
  "draftData": {
    "treatmentType": "Laser Hair Removal"
  }
}
```

### 2. Mobile App Renders Form
- Uses the `schema` to render the Form.io form
- Prepopulates with `prepopulateData` (from previous submissions)
- Shows `draftData` if user had saved a draft

### 3. User Saves Draft
**Request**: `POST /api/form-submissions/draft`
```json
{
  "formId": "FORM_CONSENT_LASER",
  "centerId": "C_NY_01",
  "savedBy": "mobile_app",
  "guestId": "GUEST_123",
  "appointmentId": "APPT_789",
  "draftData": {
    "patientName": "John Doe",
    "treatmentType": "Laser Hair Removal",
    "consent": false
  }
}
```

### 4. User Submits Form
**Request**: `POST /api/form-flow/submit/FORM_CONSENT_LASER`
```json
{
  "submissionData": {
    "patientName": "John Doe",
    "treatmentType": "Laser Hair Removal",
    "consent": true,
    "emergencyContact": "Jane Doe"
  },
  "centerId": "C_NY_01",
  "submittedBy": "mobile_app",
  "guestId": "GUEST_123",
  "appointmentId": "APPT_789"
}
```

### 5. Backend Handles Submission
- Saves submission to MongoDB
- Deletes any existing draft for this form/user
- Data is now available for future prepopulation

## Fallback Logic

The form assignment system uses a priority-based fallback:

1. **Exact Match** (100 points): `serviceId` + `centerId` match
2. **Service Match** (50 points): `serviceId` match, `centerId` null
3. **Center Match** (25 points): `centerId` match, `serviceId` null
4. **Global Default** (0 points): Both `serviceId` and `centerId` null

The system returns assignments sorted by priority score.

## Form.io Synchronization

The system provides **one-way synchronization** from Form.io to the local database to ensure forms created in Form.io are available to the mobile app.

### Synchronization Methods

#### 1. **Automatic Sync (Recommended)**
- **Webhooks**: Real-time sync when forms are created/updated in Form.io
- **Scheduled Tasks**: Hourly sync from Form.io to local database
- **One-Way Only**: Forms are only created in Form.io, never in local database

#### 2. **Manual Sync**
- **API Endpoints**: Manual sync operations for administrators
- **Bulk Operations**: Sync all forms from Form.io at once

### API Endpoints

#### Webhook Endpoint
```
POST /api/webhooks/form-io
```
Receives webhooks from Form.io when forms are created/updated/deleted.

#### Manual Sync Endpoints
```
POST /api/form-sync/from-formio/:formId    # Sync specific form from Form.io
POST /api/form-sync/all-from-formio        # Sync all forms from Form.io
GET  /api/form-sync/status                 # Get sync status
```

### Setup Instructions

#### 1. Configure Form.io Webhooks
In your Form.io project settings, configure webhooks to point to:
```
https://your-backend-domain.com/api/webhooks/form-io
```

#### 2. Set Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/form-poc
FORM_IO_DOMAIN=https://your-form-io-domain.com
FORM_IO_API_KEY=your-form-io-api-key
PORT=3000
```

#### 3. Initial Sync
After setup, run the initial sync to populate your local database:
```bash
curl -X POST http://localhost:3000/api/form-sync/all-from-formio
```

### Synchronization Flow

#### When Frontend Creates Form in Form.io:
1. **Webhook Triggered**: Form.io sends webhook to your backend
2. **Form Synced**: Backend automatically creates/updates form in local database
3. **Mobile App Ready**: Form is immediately available to mobile app

#### Form Creation Policy:
- **Forms are ONLY created in Form.io** by the frontend
- **Local database is read-only** for form creation
- **No sync to Form.io** - one-way sync only

#### Scheduled Sync (Fallback):
1. **Hourly Check**: System checks for new forms in Form.io
2. **Bulk Sync**: Any missing forms are synced to local database
3. **Error Handling**: Failed syncs are logged for investigation

### Troubleshooting

#### Forms Not Appearing in Mobile App
1. Check if webhook is configured correctly in Form.io
2. Verify `FORM_IO_API_KEY` is set correctly
3. Run manual sync: `POST /api/form-sync/all-from-formio`
4. Check logs for sync errors

#### Sync Errors
1. Verify Form.io API credentials
2. Check network connectivity to Form.io
3. Review error logs for specific issues
4. Test with manual sync endpoints

#### Important Notes
- **Forms should only be created in Form.io** - not in the local database
- **Sync is one-way only** - from Form.io to local database
- **Local form creation is disabled** - use Form.io for all form management

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `FORM_IO_DOMAIN`: Your Form.io domain for generating form URLs
- `FORM_IO_API_KEY`: Your Form.io API key for authentication
- `PORT`: Application port (default: 3000) 