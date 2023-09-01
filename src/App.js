import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
import pdfjs from 'pdfjs-dist/webpack'; // Correct import

function App() {
  const worker = createWorker({
    logger: m => console.log(m),
  });

  const extractTextFromPDF = async (pdfFile) => {
    const loadingTask = pdfjs.getDocument(pdfFile);
    const pdf = await loadingTask.promise;
    let text = '';
  
    // eslint-disable-next-line
    const extractPageText = async (pageNum) => {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      content.items.forEach((item) => {
        text += item.str + ' ';
      });
    };
  
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      await extractPageText(pageNum);
    }
  
    return text;
  };
  
  
  const doOCR = async (file) => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    let text = '';
  
    if (file.type.startsWith('image')) {
      const { data: { text: imageText } } = await worker.recognize(file);
      text = imageText;
    } else if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file);
    }
  
    setOcr(text);
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      doOCR(file);
    }
  };

  const [ocr, setOcr] = useState('Recognizing...');

  return (
    <div className="App">
      <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileInputChange} />
      <p>{ocr}</p>
    </div>
  );
}

export default App;
