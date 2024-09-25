document.getElementById('test-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const testType = document.getElementById('testType').value;
  const target = document.getElementById('target').value;
  const resultDiv = document.getElementById('result');

  if (!testType || !target) {
    alert('Please select a test type and enter a target.');
    return;
  }

  // Show loading indicator
  resultDiv.textContent = 'Executing test... Please wait.';
  resultDiv.classList.add('loading'); // Add a class for loading styles

  try {
    const response = await fetch('/api/execute-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testType, target }),
    });

    const data = await response.json();

    if (response.ok) {
      resultDiv.textContent = `Test Completed Successfully.\n\nFindings:\n${data.findings}`;
    } else {
      resultDiv.textContent = `Error: ${data.message}`;
    }
  } catch (error) {
    resultDiv.textContent =