import React, { useState } from 'react';
import Papa from 'papaparse';
import { FileUpload } from './components/FileUpload';
import { ProgressBar } from './components/ProgressBar';
import { ProcessingStatus, ProcessedEmail } from './types';
import { isScenario1, processEmailsScenario1, processEmailsScenario2 } from './utils/csvProcessor';
import { Download } from 'lucide-react';

function App() {
  const [status, setStatus] = useState<ProcessingStatus>({
    currentTask: '',
    progress: 0,
    eta: 0,
    isComplete: false
  });
  const [processedData, setProcessedData] = useState<ProcessedEmail[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setStatus({
      currentTask: 'Reading CSV file',
      progress: 0,
      eta: 0,
      isComplete: false
    });

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const headers = Object.keys(results.data[0]);
        const scenario1 = isScenario1(headers);
        
        try {
          const processed = await (scenario1
            ? processEmailsScenario1(results.data, setStatus)
            : processEmailsScenario2(results.data, setStatus));
          
          setProcessedData(processed);
          setStatus(prev => ({
            ...prev,
            currentTask: 'Processing complete',
            progress: 100,
            isComplete: true
          }));
        } catch (error) {
          console.error('Processing error:', error);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setIsProcessing(false);
      }
    });
  };

  const handleDownload = () => {
    if (!processedData) return;

    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'processed_emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CSV Email Processor</h1>
          <p className="mt-2 text-gray-600">
            Upload a CSV file to process and analyze email data
          </p>
        </div>

        {!isProcessing && !processedData && (
          <FileUpload onFileSelect={handleFileSelect} />
        )}

        {isProcessing && (
          <div className="bg-white p-6 rounded-lg shadow">
            <ProgressBar status={status} />
          </div>
        )}

        {processedData && !isProcessing && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Processing Complete
                </h2>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent 
                    rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                    hover:bg-blue-700 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
              </div>
              <p className="mt-2 text-gray-600">
                Processed {processedData.length} unique email records
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(processedData[0]).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedData.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td
                            key={j}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {value?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;