const Groq = require("groq-sdk");
const db = require('../config/database');

module.exports = {
    async processMessage(req, res) {
        const { user_id, message } = req.body;

        console.log("--- CHATBOT (GROQ) ---");
        
        // Importação Segura do .env
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.error("ERRO CRÍTICO: GROQ_API_KEY não encontrada no .env");
            return res.status(500).json({ reply: "Erro de configuração no servidor." });
        }

        if (!message) return res.status(400).json({ error: "Mensagem vazia." });

        try {
            const groq = new Groq({ apiKey: apiKey });

            // Busca Contexto
            const categories = await new Promise((resolve) => {
                db.all(`SELECT id, name FROM categories WHERE user_id = ?`, [user_id], (err, rows) => resolve(rows || []));
            });
            const accounts = await new Promise((resolve) => {
                db.all(`SELECT id, name FROM accounts WHERE user_id = ?`, [user_id], (err, rows) => resolve(rows || []));
            });

            const systemPrompt = `
                Você é uma API financeira que converte linguagem natural em JSON estrito.
                
                CONTEXTO:
                - Categorias: ${JSON.stringify(categories)}
                - Contas: ${JSON.stringify(accounts)}
                
                REGRAS:
                1. Analise: "${message}"
                2. Extraia valor, descrição, tipo (expense/income).
                3. Associe a categoria e conta mais prováveis pelos IDs.
                4. Se não achar conta, use a primeira ID disponível.
                
                RESPOSTA:
                Apenas JSON puro.
                {
                    "description": "string",
                    "amount": number,
                    "type": "expense" | "income",
                    "category_id": number,
                    "origin_id": number
                }
            `;

            console.log("Enviando para o Groq...");

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
                // MODELO ATUALIZADO (O antigo foi desligado)
                model: "llama-3.3-70b-versatile", 
                temperature: 0, 
                response_format: { type: "json_object" }
            });

            const responseContent = chatCompletion.choices[0]?.message?.content || "";
            console.log("Resposta Groq:", responseContent);

            const data = JSON.parse(responseContent);

            // Defaults
            if (!data.amount) data.amount = 0;
            const finalDate = new Date().toISOString().split('T')[0];
            if (!data.category_id && categories.length > 0) data.category_id = categories[0].id;
            if (!data.origin_id && accounts.length > 0) data.origin_id = accounts[0].id;

            // Salvar
            db.run(`INSERT INTO transactions (user_id, category_id, description, amount, type, date, origin_type, origin_id, is_fixed) VALUES (?,?,?,?,?,?,?,?,?)`,
                [user_id, data.category_id, data.description, data.amount, data.type, finalDate, 'account', data.origin_id, 0],
                function(err) {
                    if (err) {
                        console.error("Erro SQL:", err);
                        return res.status(500).json({ reply: "Erro ao salvar no banco." });
                    }
                    return res.json({
                        reply: `✅ Feito! Registrei: ${data.description} - R$ ${data.amount.toFixed(2)}`,
                        transaction: data
                    });
                }
            );

        } catch (error) {
            console.error("ERRO NO GROQ:", error);
            return res.json({ 
                reply: "Desculpe, tive um problema técnico. Tente novamente.",
                error: true 
            });
        }
    }
};