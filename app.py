from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

CORRECT_PASSWORD = "397"
RIDDLE_ANSWER = "sun"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check_password', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data.get('password', '')
    if password == CORRECT_PASSWORD:
        return jsonify(success=True)
    return jsonify(success=False)

@app.route('/check_riddle', methods=['POST'])
def check_riddle():
    data = request.get_json()
    answer = data.get('answer', '').strip().lower()
    if answer == RIDDLE_ANSWER:
        return jsonify(success=True)
    return jsonify(success=False)

if __name__ == '__main__':
    app.run(debug=True)