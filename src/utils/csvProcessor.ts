import { ProcessedEmail, ProcessingStatus } from '../types';
import { cleanDomain, getMxProvider } from './domainUtils';
import { assignOtherDmNames } from './emailEnrichment';
import { normalizeContactData } from './dataNormalization';
import { isScenario1 } from './csvValidator';

export const processEmailsScenario1 = async (
  data: any[],
  updateStatus: (status: ProcessingStatus) => void
): Promise<ProcessedEmail[]> => {
  const processedEmails: ProcessedEmail[] = [];
  const totalRows = data.length * 3; // 3 possible email columns per row
  let processedRows = 0;

  for (const row of data) {
    for (let i = 1; i <= 3; i++) {
      const email = row[`email_${i}`];
      if (email) {
        const domain = email.split('@')[1];
        const mxProvider = await getMxProvider(domain);
        
        processedEmails.push({
          email,
          fullName: row[`email_${i}_full_name`],
          firstName: row[`email_${i}_first_name`],
          lastName: row[`email_${i}_last_name`],
          title: row[`email_${i}_title`],
          phone: row[`email_${i}_phone`],
          website: cleanDomain(row.website || ''),
          mxProvider,
          otherDmName: '',
          ...Object.fromEntries(
            Object.entries(row).filter(([key]) => 
              !key.startsWith('email_')
            )
          )
        });
      }
      processedRows++;
      updateStatus({
        currentTask: 'Processing emails',
        progress: (processedRows / totalRows) * 100,
        eta: (totalRows - processedRows) * 0.5,
        isComplete: false
      });
    }
  }

  const uniqueEmails = processedEmails.filter((email, index, self) =>
    index === self.findIndex(e => e.email === email.email)
  );

  return assignOtherDmNames(uniqueEmails);
};

export const processEmailsScenario2 = async (
  data: any[],
  updateStatus: (status: ProcessingStatus) => void
): Promise<ProcessedEmail[]> => {
  const processedEmails: ProcessedEmail[] = [];
  const totalRows = data.length;
  let processedRows = 0;

  for (const row of data) {
    const email = row.email;
    if (email) {
      const domain = email.split('@')[1];
      const mxProvider = await getMxProvider(domain);
      const normalizedData = normalizeContactData(row);
      
      processedEmails.push({
        ...row,
        email,
        ...normalizedData,
        website: cleanDomain(row.website || ''),
        mxProvider,
        otherDmName: '',
      });
    }
    processedRows++;
    updateStatus({
      currentTask: 'Processing emails',
      progress: (processedRows / totalRows) * 100,
      eta: (totalRows - processedRows) * 0.5,
      isComplete: false
    });
  }

  const uniqueEmails = processedEmails.filter((email, index, self) =>
    index === self.findIndex(e => e.email === email.email)
  );

  return assignOtherDmNames(uniqueEmails);
};

export { isScenario1 };