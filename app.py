import os
from flask import Flask, request, Response
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# 加载环境变量
load_dotenv("api.env")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

app = Flask(__name__)
CORS(app)

client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

def stream_chat_response(user_message):
    def generate():
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": user_message}],
            stream=True
        )
        for chunk in response:
            delta = getattr(chunk.choices[0].delta, 'content', None)
            if delta:
                yield delta
    return Response(generate(), mimetype='text/plain')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return {'error': 'No message provided'}, 400
    try:
        return stream_chat_response(user_message)
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
