from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    return 'hello world'
    # if request.method == 'POST':
    #     if 'Ask' in request.form:
    #         return 'Old Person Page'
    #     elif 'Give' in request.form:
    #         return 'Volunteer Page'
    # return render_template('public/index.html')



if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000)
