// /api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Kunin ang 'url' parameter mula sa request.
  const { url } = req.query;

  // 2. Kung walang URL na binigay, mag-error.
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a URL parameter.' });
  }

  try {
    // 3. I-request ang actual stream URL mula sa backend.
    const targetResponse = await fetch(url, {
      headers: {
        // Ipasa ang User-Agent ng original na user.
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        // Maglagay ng default na Referer kung kinakailangan.
        'Referer': req.headers['referer'] || 'https://example.com' 
      }
    });

    // Kung hindi naging successful ang request sa stream server, ipasa ang error status.
    if (!targetResponse.ok) {
      return res.status(targetResponse.status).send(targetResponse.statusText);
    }

    // 4. Kopyahin ang headers (tulad ng content-type) mula sa stream server.
    targetResponse.headers.forEach((value, name) => {
      // Iwasan ang mga header na pwedeng magdulot ng conflict.
      if (name.toLowerCase() !== 'content-encoding' && name.toLowerCase() !== 'transfer-encoding') {
         res.setHeader(name, value);
      }
    });
    
    // 5. Ito ang pinakamahalaga: Idagdag ang CORS header para payagan ang iyong frontend.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Handle ng OPTIONS request (ginagamit ng browser bago ang actual request).
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // 6. I-stream ang content (video data) pabalik sa iyong frontend.
    const body = targetResponse.body;
    if (body) {
      // @ts-ignore - Ang Vercel response object ay sumusuporta sa pipe().
      body.pipe(res);
    } else {
      res.status(204).end(); // Walang content.
    }

  } catch (error: any) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch the requested URL.', details: error.message });
  }
}
