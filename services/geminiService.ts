
import { GoogleGenAI } from "@google/genai";
import { Asset } from "../types";

export const getPortfolioInsights = async (assets: Asset[]): Promise<string> => {
  try {
    // Initializing Gemini client using process.env.API_KEY directly as per SDK requirements
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using totalQuantity for accurate portfolio summarization
    const portfolioSummary = assets.map(a => 
      `${a.ticker} (${a.category}): Qtd ${a.totalQuantity}, Preço ${a.currentPrice.toFixed(2)}`
    ).join(', ');

    const prompt = `
      Aja como um analista financeiro profissional da Bloomberg. 
      Analise o seguinte portfólio de investimentos composto por Criptomoedas e Fundos Imobiliários Brasileiros (FIIs):
      ${portfolioSummary}
      
      Forneça uma análise concisa do sentimento do mercado em Português do Brasil (máximo 150 palavras). 
      Foque na distribuição de risco, potencial de dividendos (yield) e uma sugestão específica para rebalanceamento.
      Formate a saída em tópicos (bullet points) profissionais e concisos.
    `;

    // Using gemini-3-pro-preview for advanced financial reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Erro ao conectar com o hub de inteligência artificial. Verifique sua configuração de API.";
  }
};
