from cleanup import app, socketio

if __name__ == '__main__':
    print("")
    print("--- --- --- --- --- --- ---")
    print("-- Cleanup  Web Server --")
    print("--- --- --- --- --- --- ---")
    print("")
    socketio.run(app, port=3000)
