document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('drug-form');
    const resultList = document.getElementById('result-list');
    const loadingIndicator = document.getElementById('loading');
    const checkButton = document.getElementById('check-button');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submission triggered.');

        // Clear previous results and show loading
        resultList.innerHTML = '';
        loadingIndicator.classList.remove('hidden');
        checkButton.disabled = true;

        const drugName = document.getElementById('drug-name').value;
        const opeDay = document.getElementById('ope-day').value;

        console.log('User Inputs:', { drugName, opeDay });

        const backendApiUrl = '/api/check';

        const requestData = {
            drug_name: drugName,
            ope_day: opeDay.replace(/-/g, '/') // Format date as YYYY/MM/DD
        };

        console.log('Sending request to backend API:', { url: backendApiUrl, data: requestData });

        try {
            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('Received response from Dify. Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Dify API Response JSON:', result);

            // Assuming the text response is in result.data.outputs.text
            // You might need to adjust this based on the actual Dify workflow output
            if (result.data && result.data.outputs && result.data.outputs.text) {
                const resultText = result.data.outputs.text;
                // Split the response by newlines and create list items
                const items = resultText.split('\n').filter(item => item.trim() !== '');
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    resultList.appendChild(li);
                });
            } else {
                throw new Error('Unexpected response format from Dify API.');
            }

        } catch (error) {
            console.error('Error fetching data from Dify:', error);
            const li = document.createElement('li');
            li.textContent = `エラーが発生しました: ${error.message}`;
            li.style.color = 'red';
            resultList.appendChild(li);
        } finally {
            // Hide loading and re-enable button
            loadingIndicator.classList.add('hidden');
            checkButton.disabled = false;
            console.log('Process finished.');
        }
    });
});
