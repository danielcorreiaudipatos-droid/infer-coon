"""IA Optimization - Gemini"""
import google.generativeai as genai
class GeminiOptimizer:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-pro")
    def analyze_campaign(self, data):
        prompt = f"Analise campanha: impressões={data.get('impressions',0)}, cliques={data.get('clicks',0)}, gaste=R${data.get('spend',0)}"
        response = self.model.generate_content(prompt)
        return {"suggestions": response.text.split('\n')[:3], "ai_model": "Gemini"}
