# Trader Brother Contract System

A professional contract management system for generating and managing Master Service Agreements with digital signature functionality and Make.com integration.

## Files Structure

```
contract-system/
├── index.html          # Main contract page
├── styles.css          # All styling
├── script.js          # JavaScript functionality
├── README.md          # This file
└── config.js          # Configuration (optional)
```

## Setup Instructions

### 1. GitHub Pages Deployment

1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Your contract will be available at: `https://yourusername.github.io/repository-name`

### 2. Update Configuration

#### Update script.js:
Replace the webhook URL on line 8:
```javascript
const WEBHOOK_URL = 'https://hook.eu2.make.com/YOUR_ACTUAL_WEBHOOK_URL';
```

#### Update index.html:
Replace your company information in the Service Provider section:
```html
<strong>Company:</strong> Trader Brother<br>
<strong>Registration:</strong> [YOUR COMPANY REGISTRATION]<br>
<strong>Address:</strong> [YOUR COMPANY ADDRESS]<br>
<strong>Phone:</strong> [YOUR PHONE NUMBER]<br>
<strong>Email:</strong> [YOUR EMAIL ADDRESS]
```

## Make.com Integration

### Method 1: URL Parameters (Recommended)

You can populate the contract by sending users to your contract URL with parameters:

```
https://yourdomain.com/contract?clientCompanyName=ABC%20Company&clientContact=John%20Smith&clientEmail=john@company.com&paymentTerms=30&warrantyPeriod=12&agreementDuration=2&liabilityCap=£100,000
```

**Available Parameters:**
- `clientCompanyName` - Client company name
- `clientRegistration` - Client registration number
- `clientAddress` - Client street address
- `clientCity` - Client city
- `clientPostcode` - Client postal code
- `clientCountry` - Client country
- `clientContact` - Contact person name
- `clientPhone` - Client phone number
- `clientEmail` - Client email
- `paymentTerms` - Payment terms in days (e.g., "30")
- `warrantyPeriod` - Warranty period in months (e.g., "12")
- `agreementDuration` - Agreement duration in years (e.g., "2")
- `liabilityCap` - Liability cap amount (e.g., "£100,000")
- `additionalNotes` - Additional requirements
- `services` - Comma-separated list of services

### Method 2: Make.com Webhook Setup

#### Step 1: Create a Make.com Scenario

1. Log into Make.com
2. Create a new scenario
3. Add a **Webhook** module as the trigger
4. Copy the webhook URL and update `script.js`

#### Step 2: Process the Webhook Data

Add modules to process the incoming data:

1. **JSON Parser** - Parse the contractData
2. **Email** - Send contract to relevant parties
3. **Google Drive/Dropbox** - Save the PDF
4. **Database** - Store contract details

#### Step 3: Send Contract URL with Data

From your CRM or system, construct the URL with contract data:

```javascript
// Example: Send from your CRM system
const contractData = {
    clientCompanyName: "ABC Company Ltd",
    clientContact: "John Smith",
    clientEmail: "john@abccompany.com",
    paymentTerms: "30",
    warrantyPeriod: "12",
    agreementDuration: "2",
    liabilityCap: "£100,000"
};

// Build URL with parameters
const baseUrl = "https://yourusername.github.io/contract-system/";
const params = new URLSearchParams(contractData);
const contractUrl = baseUrl + "?" + params.toString();

// Send URL to client via email/SMS
```

### Method 3: Direct Population via Make.com

Create a Make.com scenario that:

1. **Triggers** when a new client is added to your CRM
2. **HTTP Request** to send contract data directly to your contract page
3. **Email** the pre-filled contract link to the client

Example HTTP request body:
```json
{
    "clientCompanyName": "ABC Company Ltd",
    "clientContact": "John Smith",
    "clientEmail": "john@abccompany.com",
    "clientPhone": "+44 123 456 7890",
    "paymentTerms": "30",
    "warrantyPeriod": "12",
    "agreementDuration": "2",
    "liabilityCap": "£100,000",
    "services": "Traditional Joinery & Carpentry,Fitted Furniture & Storage"
}
```

## Webhook Data Structure

When a contract is submitted, the webhook receives:

### FormData Fields:
- `pdf` - The signed contract as a PDF file
- `contractData` - JSON string containing all contract information

### Contract Data JSON Structure:
```json
{
    "clientName": "John Smith",
    "clientCompany": "ABC Company Ltd",
    "contractDate": "2025-08-22",
    "submissionDateTime": "2025-08-22T14:30:00.000Z",
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "clientCompanyName": "ABC Company Ltd",
    "clientRegistration": "12345678",
    "clientAddress": "123 Business Street",
    "clientCity": "Edinburgh",
    "clientPostcode": "EH1 1AA",
    "clientCountry": "Scotland",
    "clientContact": "John Smith",
    "clientPhone": "+44 131 123 4567",
    "clientEmail": "john@abccompany.com",
    "paymentTerms": "30",
    "warrantyPeriod": "12",
    "agreementDuration": "2",
    "liabilityCap": "£100,000",
    "additionalNotes": "Special requirements here"
}
```

## Make.com Scenario Examples

### Scenario 1: CRM to Contract Generation

**Trigger:** New lead in CRM (Airtable/Google Sheets/HubSpot)
**Actions:**
1. Get lead data
2. Format contract URL with parameters
3. Send personalized email with contract link
4. Create task reminder to follow up

### Scenario 2: Contract Processing

**Trigger:** Webhook from contract submission
**Actions:**
1. Parse contract data
2. Save PDF to Google Drive/Dropbox
3. Add client to CRM if new
4. Send confirmation email to client
5. Send notification to sales team
6. Create project in project management tool

### Scenario 3: Contract Expiry Management

**Trigger:** Scheduled (monthly)
**Actions:**
1. Check contract expiry dates
2. Send renewal reminders 3 months before expiry
3. Generate new contracts for renewals

## Security Considerations

### 1. Webhook Security
- Use HTTPS only
- Validate webhook origin
- Implement webhook signatures if sensitive data

### 2. Data Protection
- Contract data is processed client-side
- No sensitive data stored on GitHub
- PDF generation happens in browser

### 3. GDPR Compliance
- Add privacy policy link
- Include data processing consent
- Implement data retention policies

## Customization Options

### 1. Company Branding
Update colors in `styles.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
    --secondary-gradient: linear-gradient(135deg, #your-color-3 0%, #your-color-4 100%);
}
```

### 2. Contract Terms
Modify sections in `index.html` to match your business terms and local laws.

### 3. Additional Fields
Add new fields by:
1. Adding HTML elements with `data-field` attributes
2. Updating the `populateContract` function in `script.js`
3. Adding corresponding URL parameters

### 4. Service Categories
Update the services list in the HTML or make it dynamic via parameters.

## Testing

### 1. Local Testing
```bash
# Serve locally for testing
python -m http.server 8000
# or
npx serve .
```

### 2. URL Parameter Testing
Test with sample data:
```
http://localhost:8000/?clientCompanyName=Test%20Company&clientContact=John%20Doe&paymentTerms=30
```

### 3. Webhook Testing
Use tools like:
- Postman for manual testing
- ngrok for local webhook testing
- Make.com's webhook tester

## Common Issues & Solutions

### 1. Canvas Signature Not Working
- Check browser compatibility
- Ensure HTTPS for production
- Test touch events on mobile

### 2. PDF Generation Fails
- Check html2canvas compatibility
- Ensure all fonts are loaded
- Test with different browsers

### 3. Webhook Not Receiving Data
- Verify webhook URL
- Check CORS settings
- Monitor browser console for errors

### 4. URL Parameters Not Populating
- Check parameter encoding
- Verify field data-attributes match
- Test parameter parsing function

## Browser Compatibility

- **Desktop:** Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile:** iOS Safari 13+, Chrome Mobile 80+
- **Required Features:** Canvas API, FormData, Fetch API

## Support & Maintenance

### Regular Updates
- Keep external libraries updated
- Monitor webhook functionality
- Update contract terms as needed
- Test across different devices/browsers

### Monitoring
- Track contract completion rates
- Monitor webhook success/failure
- Check PDF generation quality
- Analyze user experience metrics

## License

This contract system is provided as-is. Ensure contract terms comply with local laws and regulations. Consider legal review before production use.
