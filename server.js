const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// .envファイルから環境変数を読み込む
dotenv.config();

const app = express();
const port = 3000;

// JSONリクエストボディをパースするためのミドルウェア
app.use(express.json());
// 静的ファイル(HTML, CSS, JS)を配信するためのミドルウェア
app.use(express.static(__dirname));

// Dify APIを呼び出すためのAPIエンドポイント
app.post('/api/check', async (req, res) => {
    console.log('Backend API /api/check called with:', req.body);

    const { drug_name, ope_day } = req.body;
    const difyApiKey = process.env.DIFY_API_KEY;

    if (!difyApiKey) {
        return res.status(500).json({ error: 'APIキーがサーバーに設定されていません。' });
    }

    const difyUrl = 'https://api.dify.ai/v1/workflows/run';
    const requestData = {
        inputs: {
            drug_name: drug_name,
            ope_day: ope_day
        },
        response_mode: 'blocking',
        user: 'gemini-cli-user'
    };

    console.log('Forwarding request to Dify API...');

    try {
        const difyResponse = await fetch(difyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${difyApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const responseData = await difyResponse.json();
        console.log('Received response from Dify:', responseData);

        if (!difyResponse.ok) {
            // Difyからのエラーレスポンスをクライアントに転送
            return res.status(difyResponse.status).json(responseData);
        }

        // Difyからの成功レスポンスをクライアントに転送
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error calling Dify API:', error);
        res.status(500).json({ error: 'Dify APIへのリクエスト中に内部エラーが発生しました。' });
    }
});

app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました`);
});
