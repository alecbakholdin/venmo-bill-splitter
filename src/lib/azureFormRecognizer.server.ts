import { AZURE_FORM_RECOGNIZER_ENDPOINT, AZURE_FORM_RECOGNIZER_KEY } from '$env/static/private';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';

export const receiptParserCredential = new AzureKeyCredential(AZURE_FORM_RECOGNIZER_KEY);
export const receiptParserClient = new DocumentAnalysisClient(
	AZURE_FORM_RECOGNIZER_ENDPOINT,
	receiptParserCredential
);
