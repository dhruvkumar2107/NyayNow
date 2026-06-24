const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

const apiClient = new docusign.ApiClient();
apiClient.setBasePath("https://demo.docusign.net/restapi"); // Change to www.docusign.net for Production

const INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
const USER_ID = process.env.DOCUSIGN_USER_ID;
const SCOPES = ["signature", "impersonation"];

// PRIVATE KEY for JWT Auth
// User must wrap their key in specific format or load from file
const PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY
    ? process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null;

const getAccessToken = async () => {
    if (!INTEGRATION_KEY || !USER_ID || !PRIVATE_KEY) {
        throw new Error("Missing DocuSign API Config (INTEGRATION_KEY, USER_ID, or PRIVATE_KEY)");
    }

    const results = await apiClient.requestJWTUserToken(
        INTEGRATION_KEY,
        USER_ID,
        SCOPES,
        Buffer.from(PRIVATE_KEY, 'utf8'),
        3600
    );

    return results.body.access_token;
};

const createEnvelope = async (signerEmail, signerName, documentBase64) => {
    const accessToken = await getAccessToken();
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // Create Envelope Definition
    let envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = "Please sign this document from NyayNow";

    // Create Document
    let doc = new docusign.Document();
    doc.documentBase64 = documentBase64;
    doc.name = "Agreement";
    doc.fileExtension = "pdf";
    doc.documentId = "1";

    envelopeDefinition.documents = [doc];

    // Create Signer
    let signer = new docusign.Signer();
    signer.email = signerEmail;
    signer.name = signerName;
    signer.recipientId = "1";
    signer.clientUserId = "1001"; // Must set for Embedded Signing

    // Create SignHere Tab
    let signHere = new docusign.SignHere();
    signHere.documentId = "1";
    signHere.pageNumber = "1";
    signHere.recipientId = "1";
    signHere.tabLabel = "SignHereTab";
    signHere.xPosition = "200";
    signHere.yPosition = "500";

    // Tabs
    let tabs = new docusign.Tabs();
    tabs.signHereTabs = [signHere];
    signer.tabs = tabs;

    // Recipients
    let recipients = new docusign.Recipients();
    recipients.signers = [signer];
    envelopeDefinition.recipients = recipients;

    envelopeDefinition.status = "sent";

    // Create Envelope
    const results = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, { envelopeDefinition });
    return results.envelopeId;
};

const getSigningUrl = async (envelopeId, returnUrl) => {
    const accessToken = await getAccessToken();
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    const recipientViewRequest = new docusign.RecipientViewRequest();
    recipientViewRequest.returnUrl = returnUrl;
    recipientViewRequest.authenticationMethod = 'none';
    recipientViewRequest.email = 'user@example.com'; // In prod, pass dynamic email
    recipientViewRequest.userName = 'Current User';   // In prod, pass dynamic name
    recipientViewRequest.clientUserId = "1001";       // Same as set in createEnvelope

    const results = await envelopesApi.createRecipientView(process.env.DOCUSIGN_ACCOUNT_ID, envelopeId, { recipientViewRequest });

    return results.url;
};

module.exports = { createEnvelope, getSigningUrl };
