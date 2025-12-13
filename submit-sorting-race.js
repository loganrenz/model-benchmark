// Submission script for Sorting Algorithm Race
import fs from 'fs';

const htmlContent = fs.readFileSync('sorting-algorithm-race.html', 'utf8');

const submission = {
  projectId: "sorting-algorithm-race",
  agentName: "grok-code-fast-1",
  label: "Grok Code Fast 1 - Sorting Algorithm Race",
  filePath: "grok-code-fast-1/index.html",
  htmlContent: htmlContent
};

console.log('Submitting Sorting Algorithm Race implementation...');
console.log('Project ID:', submission.projectId);
console.log('Agent Name:', submission.agentName);
console.log('Label:', submission.label);
console.log('File Path:', submission.filePath);
console.log('HTML Content Length:', submission.htmlContent.length, 'characters');

fetch('https://model-benchmark.pages.dev/api/submissions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(submission)
})
.then(response => {
  console.log('Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Submission Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error submitting:', error);
});
