export const cleanDomain = (url: string): string => {
  if (!url) return '';
  try {
    const domain = url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0];
    return domain;
  } catch (error) {
    return url;
  }
};

export const getMxProvider = async (domain: string): Promise<string> => {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=mx`);
    const data = await response.json();
    const mxRecord = data.Answer?.[0]?.data.toLowerCase() || '';
    
    if (mxRecord.includes('google') || mxRecord.includes('gmail')) {
      return 'google';
    } else if (mxRecord.includes('outlook') || mxRecord.includes('microsoft')) {
      return 'outlook';
    }
    return 'others';
  } catch (error) {
    return 'unknown';
  }
};